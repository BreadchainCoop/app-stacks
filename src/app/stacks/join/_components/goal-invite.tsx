"use client";

import Loading from "@/app/loading";
import Alert from "@/components/alert";
import LocalButton from "@/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import { useGoal, GoalInfo } from "@/hooks/use-goal";
import { useGoalSavingsTx } from "@/hooks/use-goal-savings-tx";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { GOAL_JOIN_ERRORS, GOAL_SAVINGS_ERRORS } from "@/lib/contract-errors";
import { stackMetadataId, stackTypeDetailPath } from "@/lib/stack-types";
import { formatAddress } from "@/utils/address";
import { getDefaultChainId } from "@/utils/chain";
import { formatShortDate } from "@/utils/time";
import { parseContractError } from "@/utils/parse-contract-error";
import {
  Body,
  formatBalance,
  Heading1,
  LoginButton,
  useConnectedUser,
} from "@breadcoop/ui";
import { CheckIcon, ConfettiIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { formatEther, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import { readContractQueryKey } from "wagmi/query";

export default function GoalInvite() {
  const searchParams = useSearchParams();
  const parsedId = BigInt(searchParams.get("circleId") || "0");

  const goalResult = useGoal(parsedId);

  return (
    <div className="*:mb-6 last:mb-0 page-layout py-6 w-full max-w-142 mx-auto card-shadow-bg">
      <div className="flex flex-col text-center items-center justify-center gap-3">
        <ConfettiIcon className="size-20 fill-primary-blue" />
        <Heading1 className="text-2xl leading-6">You are invited!</Heading1>
        <Body className="">
          Accept this invite to join this goal savings journey.
        </Body>
      </div>

      {goalResult.data ? (
        <>
          <GoalInviteDetails goal={goalResult.data} />

          <Alert
            closeAble={false}
            variant="warning"
            title="IMPORTANT: This invite can only be accepted once!"
            description="Each invite is unique and can only be accepted once."
          />

          <GoalAcceptInvite />

          <Body>
            Note: You can also access your member invite links through your goal
            detail page.
          </Body>
        </>
      ) : goalResult.error ? (
        <Body className="text-system-red text-center">
          Unable to load goal details. Please try again.
        </Body>
      ) : (
        <div className="flex items-center justify-center">
          <Loading />
        </div>
      )}
    </div>
  );
}

function GoalInviteDetails({ goal }: { goal: GoalInfo }) {
  const searchParams = useSearchParams();
  const goalId = searchParams.get("circleId") as string;
  const goalName = searchParams.get("name") || "-";
  const members = searchParams.get("members");

  return (
    <div className="border-t border-blue-0 pt-6">
      <Body className="text-center mb-6">
        You have been invited to join the &quot;{goalName}&quot; goal savings.
      </Body>

      <Accordion defaultValue="details">
        <AccordionItem
          value="details"
          className="border-blue-0! bg-transparent!"
        >
          <AccordionHeader>Goal details</AccordionHeader>
          <AccordionContent>
            <div className="">
              <RowDetail label="Goal name" body={goalName} />
              <RowDetail label="Goal ID" body={goalId} />
              {members && <RowDetail label="Members" body={members} />}
              <RowDetail
                label="Goal amount"
                body={`${formatBalance(+formatEther(goal.goalAmount), 2)} BREAD`}
              />
              <RowDetail
                label="Deadline"
                body={formatShortDate(Number(goal.deadline) * 1000)}
              />
              <RowDetail
                label="Beneficiary"
                body={
                  goal.beneficiary !== zeroAddress
                    ? formatAddress(goal.beneficiary)
                    : "None — members reclaim their share"
                }
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

function RowDetail({ label, body }: { label: string; body: string | number }) {
  return (
    <div className="flex items-center justify-between mb-2.5 last:mb-0">
      <Body className="text-surface-grey">{label}</Body>
      <Body bold className="text-surface-ink">
        {body}
      </Body>
    </div>
  );
}

function GoalAcceptInvite() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useConnectedUser();
  const { sendGoalSavingsTx } = useGoalSavingsTx();
  const { user: privyUser } = usePrivy();
  const queryClient = useQueryClient();

  const address = user.status === "CONNECTED" ? user.address : undefined;

  const goalId = searchParams.get("circleId") as string;
  const parsedId = BigInt(goalId || "0");
  const nonce = searchParams.get("nonce");
  const signature = searchParams.get("signature");

  const [redeeming, setRedeeming] = useState(false);

  const { data: isMember, error: isMemberError } = useReadContract({
    abi: goalSavingCirclesAbi,
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    functionName: "isMember",
    args: [parsedId, address as `0x${string}`],
    query: {
      enabled:
        (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") &&
        !!address,
    },
    chainId: getDefaultChainId(),
  });

  const { data: isNonceUsed } = useReadContract({
    abi: goalSavingCirclesAbi,
    address: GOAL_SAVINGS_CONTRACT_ADDRESS,
    functionName: "usedNonces",
    args: [parsedId, BigInt(nonce || "0")],
    query: {
      enabled: !!nonce,
    },
    chainId: getDefaultChainId(),
  });

  const redeemInvite = async () => {
    if (user.status !== "CONNECTED" || !address || !nonce || !signature) return;

    setRedeeming(true);

    try {
      await sendGoalSavingsTx({
        functionName: "redeemInvite",
        args: [parsedId, BigInt(nonce), signature as `0x${string}`],
      });

      const isMemberKey = readContractQueryKey({
        abi: goalSavingCirclesAbi,
        address: GOAL_SAVINGS_CONTRACT_ADDRESS,
        functionName: "isMember",
        args: [parsedId, address as `0x${string}`],
        chainId: getDefaultChainId(),
      });
      queryClient.setQueryData(isMemberKey, true);
      await queryClient.invalidateQueries({ queryKey: isMemberKey });

      try {
        const res = await fetch("/api/stacks/invite", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            circleId: stackMetadataId("goal", goalId),
            nonce,
            privyUserId: privyUser?.id,
            stackType: "goal",
          }),
        });
        if (!res.ok) {
          console.error(
            "goal-invite: /api/stacks/invite PATCH failed",
            res.status,
            await res.text().catch(() => "")
          );
        }
      } catch (patchErr) {
        console.error("goal-invite: /api/stacks/invite PATCH error", patchErr);
      }

      router.push(stackTypeDetailPath("goal", goalId));
    } catch (error) {
      alert(
        parseContractError(
          error,
          { ...GOAL_SAVINGS_ERRORS, ...GOAL_JOIN_ERRORS },
          "Failed to redeem invite."
        )
      );
    } finally {
      setRedeeming(false);
    }
  };

  if (user.status !== "CONNECTED") {
    return <LoginButton app="stacks" status={user.status} />;
  }

  if (!address) {
    return (
      <Body className="text-center">Reconnect your wallet to continue.</Body>
    );
  }

  if (typeof isMember === "boolean") {
    if (isMember) {
      return (
        <Body className="text-system-green text-center">
          You are already a member of this goal!
        </Body>
      );
    }

    if (isNonceUsed) {
      return (
        <Body className="text-white w-full bg-surface-grey text-center py-4 px-8">
          Invitation already used
        </Body>
      );
    }

    return (
      <LocalButton
        onClick={redeemInvite}
        leftIcon={redeeming ? undefined : <CheckIcon size={24} />}
        className="w-full"
        variant="positive"
        disabled={redeeming}
      >
        {redeeming ? <Loading /> : "Accept invite"}
      </LocalButton>
    );
  }

  if (isMemberError) {
    return (
      <Body className="text-system-red text-center">
        Unable to get data! Please refresh the page!
      </Body>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Loading />
    </div>
  );
}
