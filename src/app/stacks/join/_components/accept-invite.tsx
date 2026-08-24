"use client";

import Loading from "@/app/loading";
import LocalButton from "@/components/button";
import { useAutomaticClaims } from "@/hooks/use-automatic-claims";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { isLocalMode } from "@/lib/network-mode";
import { redeemLocalInvite } from "@/lib/local-metadata";
import { Body, LoginButton, useConnectedUser } from "@breadcoop/ui";
import { CheckIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useReadContract } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { readContractQueryKey } from "wagmi/query";
import { CircleParams } from "./interface";

const errorMessages: Record<string, string> = {
  InviteAlreadyUsed: "This invitation has already been used.",
  AlreadyMember: "You are already a member of this circle.",
  AlreadyActive: "This circle has already started.",
  NotCommissioned: "This circle does not exist.",
  InvalidSigner: "This invitation link is invalid.",
};

type AcceptInvite = Pick<CircleParams, "circleId" | "nonce" | "signature">;

export default function AcceptInvite({
  circleId,
  nonce,
  signature,
}: AcceptInvite) {
  const router = useRouter();
  const { user } = useConnectedUser();
  const { sendSavingCirclesTx } = useSavingCirclesTx();
  const { activate: enableAutomaticClaims } = useAutomaticClaims();
  const { user: privyUser } = usePrivy();
  const queryClient = useQueryClient();

  const address = user.status === "CONNECTED" ? user.address : undefined;

  const parsedId = BigInt(circleId || "");

  const [redeeming, setRedeeming] = useState(false);

  const { data: isMember, error: isMemberError } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
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
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "usedNonces",
    args: [parsedId, BigInt(nonce || "0")],
    query: {
      enabled: !!nonce,
    },
    chainId: getDefaultChainId(),
  });

  const redeemInvite = async () => {
    if (
      redeeming ||
      user.status !== "CONNECTED" ||
      !address ||
      !nonce ||
      !signature
    )
      return;

    setRedeeming(true);

    try {
      await sendSavingCirclesTx({
        functionName: "redeemInvite",
        args: [parsedId, BigInt(nonce), signature as `0x${string}`],
      });

      const isMemberKey = readContractQueryKey({
        abi: savingCirclesAbi,
        address: SAVING_CIRCLES_CONTRACT_ADDRESS,
        functionName: "isMember",
        args: [parsedId, address as `0x${string}`],
        chainId: getDefaultChainId(),
      });

      router.push(`/stacks/${circleId}`);

      queryClient.setQueryData(isMemberKey, true);
      queryClient.invalidateQueries({ queryKey: isMemberKey });

      if (isLocalMode()) {
        // No API routes in local mode: record the redemption in localStorage.
        redeemLocalInvite({ circleId, nonce, address: user.address });
      } else {
        fetch("/api/stacks/invite", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ circleId, nonce, privyUserId: privyUser?.id }),
        }).catch((error) => {
          console.error("Failed to mark invite as used:", error);
        });
      }

      // Not awaited: the redirect above should not wait on the opt-in tx. The
      // hook primes the toggle's query cache once it lands.
      enableAutomaticClaims(parsedId, true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      const contractError =
        (error?.cause?.data?.errorName as string | undefined) ||
        error?.metaMessages?.[0]?.match(/Error:\s*(\w+)\(\)/)?.[1];

      const shortMessage = error?.shortMessage as string;
      const message =
        errorMessages[contractError ?? ""] ||
        shortMessage ||
        "Failed to redeem invite.";

      alert(message);
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
          You are already a member of this circle!
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
        isLoading={redeeming}
      >
        Accept invite
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
