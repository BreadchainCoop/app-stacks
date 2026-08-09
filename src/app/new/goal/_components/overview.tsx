"use client";

import LocalButton from "@/components/button";
import {
  Body,
  formatBalance,
  Heading3,
  LoginButton,
  useConnectedUser,
} from "@breadcoop/ui";
import {
  ArrowLeftIcon,
  CalendarIcon,
  HandCoinsIcon,
  Icon,
  LayoutIcon,
  SparkleIcon,
  TargetIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { useFormContext } from "react-hook-form";
import { GoalFormSchemaData } from "./schema";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import {
  BREAD_TOKEN_ADDRESS,
  GOAL_SAVINGS_CONTRACT_ADDRESS,
} from "@/lib/constants";
import {
  Address,
  encodeFunctionData,
  parseEther,
  parseEventLogs,
  zeroAddress,
} from "viem";
import { useModal } from "@/components/modal/context";
import { sleep } from "@/utils/sleep";
import { waitForTransactionReceipt } from "@wagmi/core";
import { getDefaultChainId } from "@/utils/chain";
import { wagmiConfig } from "@/components/providers/web3";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { simulateContract } from "@wagmi/core";
import { parseContractError } from "@/utils/parse-contract-error";
import { GOAL_CREATE_ERRORS, GOAL_SAVINGS_ERRORS } from "@/lib/contract-errors";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { formatAddress } from "@/utils/address";
import { dateInputToMs, formatShortDate } from "@/utils/time";

const parseCreateError = (error: unknown) =>
  parseContractError(
    error,
    { ...GOAL_SAVINGS_ERRORS, ...GOAL_CREATE_ERRORS },
    "Failed to create goal. Please try again."
  );

const GoalOverviewForm = ({ onBack }: { onBack: () => void }) => {
  const modal = useModal();
  const blockTimestamp = useBlockTimestamp();
  const form = useFormContext<GoalFormSchemaData>();
  const members = form.watch("members");
  const goalAmount = form.watch("goalAmount");
  const deadline = form.watch("deadline");
  const beneficiaryMode = form.watch("beneficiaryMode");
  const beneficiary = form.watch("beneficiary");
  const { user } = useConnectedUser();
  const { sendSponsoredTransaction } = useSponsoredTx();

  const deadlineMs = deadline ? dateInputToMs(deadline) : NaN;

  const createGoal = async (data: GoalFormSchemaData) => {
    try {
      // This is just for typescript check. user is available at this point
      if (user.status !== "CONNECTED") return;

      // A date input yields YYYY-MM-DD; the deadline is midnight at the start
      // of that date, in the user's own timezone.
      const deadlineSeconds = BigInt(
        Math.floor(dateInputToMs(data.deadline) / 1000)
      );

      // Pre-check against block time (never Date.now — local Anvil warps time)
      if (deadlineSeconds <= BigInt(Math.floor(blockTimestamp / 1000))) {
        form.setError("deadline", {
          message: "The deadline must be in the future",
        });
        return;
      }

      modal.setModal({
        type: "GOAL_CREATION_INIT",
        name: data.name,
        status: "awaiting",
      });

      const beneficiaryAddress =
        data.beneficiaryMode === "beneficiary"
          ? (data.beneficiary as Address)
          : zeroAddress;
      const parsedGoalAmount = parseEther(String(data.goalAmount));
      const createArgs = [
        BREAD_TOKEN_ADDRESS,
        parsedGoalAmount,
        deadlineSeconds,
        beneficiaryAddress,
      ] as const;

      // Simulate before opening Privy modal
      await simulateContract(wagmiConfig, {
        address: GOAL_SAVINGS_CONTRACT_ADDRESS,
        abi: goalSavingCirclesAbi,
        functionName: "create",
        args: createArgs,
        account: user.address,
        chainId: getDefaultChainId(),
      });

      const encodedData = encodeFunctionData({
        abi: goalSavingCirclesAbi,
        functionName: "create",
        args: createArgs,
      });

      const sponsoredTx = sendSponsoredTransaction(
        { to: GOAL_SAVINGS_CONTRACT_ADDRESS, data: encodedData },
        { uiOptions: { showWalletUIs: false } }
      );

      modal.setModal({
        type: "GOAL_CREATION_INIT",
        name: data.name,
        status: "approved",
      });

      const { hash } = await sponsoredTx;

      const receipt = await waitForTransactionReceipt(wagmiConfig, {
        hash,
        confirmations: 1,
      });

      const logs = parseEventLogs({
        abi: goalSavingCirclesAbi,
        logs: receipt.logs,
        eventName: "GoalCreated",
      });

      const newGoalId = logs[0]?.args.id;

      if (newGoalId === undefined) {
        throw new Error("GoalCreated event not found");
      }

      modal.setModal({
        type: "GOAL_CREATION_INIT",
        name: data.name,
        status: "successful",
      });

      const goal = {
        name: data.name,
        id: newGoalId.toString(),
        goalAmount: parsedGoalAmount,
        deadline: deadlineSeconds,
        beneficiary:
          beneficiaryAddress === zeroAddress ? undefined : beneficiaryAddress,
        members: data.members,
      };

      await sleep(500);
      modal.setModal({ type: "GOAL_CREATION_SUCCESS", goal });

      form.reset();
    } catch (error) {
      console.error("__ ERROR __", error);
      modal.setModal({
        type: "GOAL_CREATION_FAILED",
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
        <Body className="text-surface-grey">Please review your goal.</Body>
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
          RIcon={TargetIcon}
          title="Goal amount"
          body={
            Number.isFinite(goalAmount)
              ? `${formatBalance(goalAmount, 2)} BREAD`
              : "-"
          }
        />
        <ReviewedRow
          RIcon={CalendarIcon}
          title="Deadline"
          body={Number.isNaN(deadlineMs) ? "-" : formatShortDate(deadlineMs)}
        />
        <ReviewedRow
          RIcon={HandCoinsIcon}
          title="On success"
          body={
            beneficiaryMode === "beneficiary"
              ? beneficiary
                ? `Released to ${formatAddress(beneficiary as Address)}`
                : "Released to beneficiary"
              : "Members reclaim their share"
          }
        />
      </div>
      <div className="px-6 py-3 bg-paper-1">
        <Body className="text-xs text-surface-grey-2">
          Contributions are locked while the goal is funding.
        </Body>
        <Body className="text-xs text-surface-grey-2">
          If the goal isn&apos;t reached by the deadline, or the organizer
          cancels it, every member gets back exactly what they deposited.
        </Body>
      </div>
      <div className="flex flex-col gap-4">
        {user.status === "CONNECTED" ? (
          <LocalButton
            leftIcon={<SparkleIcon size={24} />}
            onClick={form.handleSubmit(createGoal)}
            type="submit"
          >
            Create Goal
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

export default GoalOverviewForm;
