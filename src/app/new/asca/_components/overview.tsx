"use client";

import LocalButton from "@/components/button";
import { Body, Heading3, LoginButton, useConnectedUser } from "@breadcoop/ui";
import {
  ArrowLeftIcon,
  CalendarIcon,
  HandCoinsIcon,
  Icon,
  LayoutIcon,
  PercentIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { AscaFormSchemaData } from "./schema";
import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS, BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { encodeFunctionData, parseEventLogs } from "viem";
import { useModal } from "@/components/modal/context";
import { sleep } from "@/utils/sleep";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { simulateContract } from "@wagmi/core";
import { parseContractError } from "@/utils/parse-contract-error";
import { getIntervalById } from "@/utils/deposit-interval";
import { ASCA_CREATE_ERRORS, ASCA_ERRORS } from "@/lib/contract-errors";
import { percentToBps } from "@/lib/asca-state";

const parseCreateError = (error: unknown) =>
  parseContractError(
    error,
    { ...ASCA_ERRORS, ...ASCA_CREATE_ERRORS },
    "Failed to create fund. Please try again."
  );

const AscaOverviewForm = ({ onBack }: { onBack: () => void }) => {
  const modal = useModal();
  const form = useFormContext<AscaFormSchemaData>();
  const periodLength = form.watch("periodLength");
  const interval = getIntervalById(periodLength);
  const members = form.watch("members");
  const borrowLimit = form.watch("borrowLimit");
  const interestRate = form.watch("interestRate");
  const repaymentPeriods = form.watch("repaymentPeriods");
  const { user } = useConnectedUser();
  const { sendSponsoredTransaction } = useSponsoredTx();

  const createFund = async (data: AscaFormSchemaData) => {
    try {
      // This is just for typescript check. user is available at this point
      if (user.status !== "CONNECTED") return;
      // This is just for typescript check. interval is available at this point
      if (!interval) return;

      modal.setModal({
        type: "ASCA_CREATION_INIT",
        name: data.name,
        status: "awaiting",
      });

      const borrowLimitBps = percentToBps(data.borrowLimit);
      const interestRateBps = percentToBps(data.interestRate);
      const createArgs = [
        BREAD_TOKEN_ADDRESS,
        BigInt(borrowLimitBps),
        BigInt(interestRateBps),
        BigInt(data.repaymentPeriods),
        BigInt(interval.seconds),
      ] as const;

      // Simulate before opening Privy modal
      await simulateContract(wagmiConfig, {
        address: ASCA_CONTRACT_ADDRESS,
        abi: accumulatingSavingCirclesAbi,
        functionName: "create",
        args: createArgs,
        account: user.address,
      });

      const encodedData = encodeFunctionData({
        abi: accumulatingSavingCirclesAbi,
        functionName: "create",
        args: createArgs,
      });

      const sponsoredTx = sendSponsoredTransaction(
        { to: ASCA_CONTRACT_ADDRESS, data: encodedData },
        { uiOptions: { showWalletUIs: false } }
      );

      modal.setModal({
        type: "ASCA_CREATION_INIT",
        name: data.name,
        status: "approved",
      });

      const { hash } = await sponsoredTx;

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1,
      });

      const logs = parseEventLogs({
        abi: accumulatingSavingCirclesAbi,
        logs: receipt.logs,
        eventName: "FundCreated",
      });

      const newFundId = logs[0]?.args.id;

      if (newFundId === undefined) {
        throw new Error("FundCreated event not found");
      }

      modal.setModal({
        type: "ASCA_CREATION_INIT",
        name: data.name,
        status: "successful",
      });

      const fund = {
        name: data.name,
        id: newFundId.toString(),
        borrowLimitBps,
        interestRateBps,
        repaymentPeriods: data.repaymentPeriods,
        periodLength: BigInt(interval.seconds),
        members: data.members,
      };

      await sleep(500);
      modal.setModal({ type: "ASCA_CREATION_SUCCESS", fund });

      form.reset();
    } catch (error) {
      console.error("__ ERROR __", error);
      modal.setModal({
        type: "ASCA_CREATION_FAILED",
        msg: parseCreateError(error),
      });
    }
  };

  return (
    <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26] lg:bg-paper-main lg:border lg:border-blue-0">
      <header className="">
        <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
          Overview
        </Heading3>
        <Body className="text-surface-grey">Please review your fund.</Body>
      </header>
      <div className="flex flex-col gap-4 pb-4 border-b border-blue-0">
        <ReviewedRow
          RIcon={LayoutIcon}
          title="Name"
          body={form.watch("name") || "-"}
        />
        <ReviewedRow
          RIcon={UsersThreeIcon}
          title="Members"
          body={members ? String(members) : "-"}
        />
        <ReviewedRow
          RIcon={HandCoinsIcon}
          title="Borrow limit"
          body={
            Number.isFinite(borrowLimit) ? `${borrowLimit}% of savings` : "-"
          }
        />
        <ReviewedRow
          RIcon={PercentIcon}
          title="Interest per period"
          body={Number.isFinite(interestRate) ? `${interestRate}%` : "-"}
        />
        <ReviewedRow
          RIcon={CalendarIcon}
          title="Period length"
          body={interval ? interval.description || interval.label : "-"}
          capitalize
        />
        <ReviewedRow
          RIcon={CalendarIcon}
          title="Loans due after"
          body={
            Number.isFinite(repaymentPeriods)
              ? `${repaymentPeriods} ${repaymentPeriods === 1 ? "period" : "periods"}`
              : "-"
          }
        />
      </div>
      <div className="px-6 py-3 bg-paper-1">
        <Body className="text-xs text-surface-grey-2">
          This fund is not a regulated savings or credit product.
        </Body>
        <Body className="text-xs text-surface-grey-2">
          Loans are always collateralized by the borrower&apos;s own savings,
          and interest paid on loans is distributed to all savers in the fund.
        </Body>
      </div>
      <div className="flex flex-col gap-4">
        {user.status === "CONNECTED" ? (
          <LocalButton
            leftIcon={<SparkleIcon size={24} />}
            onClick={form.handleSubmit(createFund)}
            type="submit"
          >
            Create Fund
          </LocalButton>
        ) : (
          <LoginButton app="stacks" status={user.status} />
        )}
        <LocalButton
          className="lg:hidden"
          variant="secondary"
          leftIcon={<ArrowLeftIcon size={24} />}
          onClick={onBack}
          type="button"
        >
          Back
        </LocalButton>
      </div>
    </section>
  );
};

function ReviewedRow({
  RIcon,
  title,
  body,
  capitalize,
}: {
  RIcon: Icon;
  title: string;
  body: string;
  capitalize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-2">
        {<RIcon size={24} className="fill-primary-blue" />}
        <Body className="text-surface-grey-2">{title}</Body>
      </div>
      <Body
        bold
        className={`text-surface-ink ${capitalize ? "capitalize" : ""}`}
      >
        {body}
      </Body>
    </div>
  );
}

export default AscaOverviewForm;
