"use client";

import LocalButton from "@/components/button";
import { Body, Heading3, LoginButton, useConnectedUser } from "@breadcoop/ui";
import {
  ArrowLeftIcon,
  CalendarIcon,
  Icon,
  LayoutIcon,
  PercentIcon,
  SparkleIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { CollectiveFormSchemaData, getThresholdById } from "./schema";
import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import {
  BREAD_TOKEN_ADDRESS,
  COLLECTIVE_FUND_CONTRACT_ADDRESS,
} from "@/lib/constants";
import { encodeFunctionData, parseEventLogs } from "viem";
import { useModal } from "@/components/modal/context";
import { sleep } from "@/utils/sleep";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { simulateContract } from "@wagmi/core";
import { parseContractError } from "@/utils/parse-contract-error";
import { getIntervalById } from "@/utils/deposit-interval";
import {
  COLLECTIVE_CREATE_ERRORS,
  COLLECTIVE_FUND_ERRORS,
} from "@/lib/contract-errors";
import { percentToBps } from "@/lib/asca-state";

const parseCreateError = (error: unknown) =>
  parseContractError(
    error,
    { ...COLLECTIVE_FUND_ERRORS, ...COLLECTIVE_CREATE_ERRORS },
    "Failed to create fund. Please try again."
  );

const CollectiveOverviewForm = ({ onBack }: { onBack: () => void }) => {
  const modal = useModal();
  const form = useFormContext<CollectiveFormSchemaData>();
  const votingPeriod = form.watch("votingPeriod");
  const interval = getIntervalById(votingPeriod);
  const members = form.watch("members");
  const approvalThreshold = form.watch("approvalThreshold");
  const threshold = getThresholdById(approvalThreshold);
  const { user } = useConnectedUser();
  const { sendSponsoredTransaction } = useSponsoredTx();

  const createFund = async (data: CollectiveFormSchemaData) => {
    try {
      // This is just for typescript check. user is available at this point
      if (user.status !== "CONNECTED") return;
      // This is just for typescript check. Both are available at this point
      if (!interval || !threshold) return;

      modal.setModal({
        type: "COLLECTIVE_CREATION_INIT",
        name: data.name,
        status: "awaiting",
      });

      const approvalThresholdBps = percentToBps(threshold.percent);
      const votingPeriodSeconds = BigInt(interval.seconds);
      const createArgs = [
        BREAD_TOKEN_ADDRESS,
        user.address,
        data.name,
        votingPeriodSeconds,
        BigInt(approvalThresholdBps),
      ] as const;

      // Simulate before opening Privy modal
      await simulateContract(wagmiConfig, {
        address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
        abi: collectiveFundCirclesAbi,
        functionName: "create",
        args: createArgs,
        account: user.address,
      });

      const encodedData = encodeFunctionData({
        abi: collectiveFundCirclesAbi,
        functionName: "create",
        args: createArgs,
      });

      const sponsoredTx = sendSponsoredTransaction(
        { to: COLLECTIVE_FUND_CONTRACT_ADDRESS, data: encodedData },
        { uiOptions: { showWalletUIs: false } }
      );

      modal.setModal({
        type: "COLLECTIVE_CREATION_INIT",
        name: data.name,
        status: "approved",
      });

      const { hash } = await sponsoredTx;

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1,
      });

      const logs = parseEventLogs({
        abi: collectiveFundCirclesAbi,
        logs: receipt.logs,
        eventName: "FundCreated",
      });

      const newFundId = logs[0]?.args.id;

      if (newFundId === undefined) {
        throw new Error("FundCreated event not found");
      }

      modal.setModal({
        type: "COLLECTIVE_CREATION_INIT",
        name: data.name,
        status: "successful",
      });

      const fund = {
        name: data.name,
        id: newFundId.toString(),
        votingPeriod: votingPeriodSeconds,
        approvalThresholdBps,
        members: data.members,
      };

      await sleep(500);
      modal.setModal({ type: "COLLECTIVE_CREATION_SUCCESS", fund });

      form.reset();
    } catch (error) {
      console.error("__ ERROR __", error);
      modal.setModal({
        type: "COLLECTIVE_CREATION_FAILED",
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
          RIcon={CalendarIcon}
          title="Voting period"
          body={interval ? interval.description || interval.label : "-"}
          capitalize
        />
        <ReviewedRow
          RIcon={PercentIcon}
          title="Approval threshold"
          body={threshold ? `${threshold.label} (${threshold.percent}%)` : "-"}
        />
      </div>
      <div className="px-6 py-3 bg-paper-1">
        <Body className="text-xs text-surface-grey-2">
          Spending proposals need the approval threshold of members who were in
          the fund when the proposal was created.
        </Body>
        <Body className="text-xs text-surface-grey-2">
          Members can leave anytime and take their pro-rata share of whatever
          remains in the pool.
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

export default CollectiveOverviewForm;
