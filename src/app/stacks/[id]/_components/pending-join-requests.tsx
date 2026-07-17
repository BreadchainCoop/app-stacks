"use client";

import PendingInviteLink from "@/components/pending-invite-link";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { buildInviteUrl } from "@/components/modal/modals/stack-result";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { clientEnv } from "@/lib/env";
import { JoinRequestRow } from "@/lib/supabase";
import { formatAddress } from "@/utils/address";
import { getDefaultChainId } from "@/utils/chain";
import { getIntervalBySeconds } from "@/utils/deposit-interval";
import { shortenUrl } from "@/utils/shorten";
import { formatShortDate } from "@/utils/time";
import { Body, formatBalance, Heading3 } from "@breadcoop/ui";
import { CheckIcon, XIcon } from "@phosphor-icons/react";
import { usePrivy, useSignTypedData } from "@privy-io/react-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatEther } from "viem";
import { usePublicClient } from "wagmi";

const INVITE_DOMAIN_NAME = "StacksInvite";
const INVITE_DOMAIN_VERSION = "1";
const DEFAULT_CHAIN = getDefaultChainId();
const isLocal = clientEnv.NEXT_PUBLIC_NODE_ENV === "local";

interface JoinRequestsResponse {
  isOwner: boolean;
  requests: JoinRequestRow[];
}

const PendingJoinRequests = ({
  id,
  stackName,
  expectedMembers,
  depositAmount,
  depositInterval,
}: {
  id: string;
  stackName: string;
  expectedMembers: number;
  depositAmount: bigint;
  depositInterval: bigint;
}) => {
  const { user: privyUser } = usePrivy();
  const queryClient = useQueryClient();

  const queryKey = ["join-requests", id, privyUser?.id];

  const { data } = useQuery<JoinRequestsResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/stacks/join-requests?circleId=${id}&privyUserId=${privyUser?.id}`
      );
      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to load join requests");
      }

      return { isOwner: body.isOwner, requests: body.requests };
    },
    enabled: !!privyUser?.id,
    refetchInterval: 30_000,
  });

  const pending = (data?.requests ?? []).filter(
    (request) => request.status === "pending"
  );

  const onDecided = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["stack-metadata", id] });
  };

  if (!data?.isOwner || pending.length === 0) return null;

  return (
    <section className="p-4 flex flex-col gap-4 border-t border-paper-2">
      <Heading3 className="pb-1 leading-[100%] text-2xl">
        Requests to join ({pending.length})
      </Heading3>
      <div className="*:mb-2 *:last:mb-0">
        {pending.map((request) => (
          <JoinRequestRowItem
            key={request.id}
            id={id}
            stackName={stackName}
            expectedMembers={expectedMembers}
            depositAmount={depositAmount}
            depositInterval={depositInterval}
            request={request}
            onDecided={onDecided}
          />
        ))}
      </div>
    </section>
  );
};

const JoinRequestRowItem = ({
  id,
  stackName,
  expectedMembers,
  depositAmount,
  depositInterval,
  request,
  onDecided,
}: {
  id: string;
  stackName: string;
  expectedMembers: number;
  depositAmount: bigint;
  depositInterval: bigint;
  request: JoinRequestRow;
  onDecided: () => void;
}) => {
  const { user: privyUser } = usePrivy();
  const { setModal } = useModal();
  const publicClient = usePublicClient({ chainId: getDefaultChainId() });
  const { signTypedData } = useSignTypedData();
  const blockTimestamp = useBlockTimestamp();
  const [busy, setBusy] = useState<"approving" | "rejecting" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [approvedLink, setApprovedLink] = useState<string | null>(null);

  const decide = async (
    action: "approve" | "reject",
    inviteLink?: {
      nonce: string;
      signature: string;
      short: string;
      long: string;
    }
  ) => {
    const res = await fetch("/api/stacks/join-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        circleId: id,
        requestId: request.id,
        privyUserId: privyUser?.id,
        action,
        inviteLink,
      }),
    });
    const body = await res.json();

    if (!res.ok || !body.success) {
      throw new Error(body.error ?? `Failed to ${action} request`);
    }
  };

  const approve = async () => {
    if (!publicClient) return;

    setBusy("approving");
    setError(null);

    try {
      const circleId = BigInt(id);
      let candidate = BigInt(isLocal ? blockTimestamp : Date.now());

      while (
        await publicClient.readContract({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          abi: savingCirclesAbi,
          functionName: "usedNonces",
          args: [circleId, candidate],
        })
      ) {
        candidate += BigInt(1);
      }

      // signTypedData serializes the message for the embedded wallet and
      // can't handle raw BigInts — mirrors the conversion in
      // stack-result.tsx's generateInvites.
      const toTypedDataUint = (value: bigint) =>
        value < BigInt(Number.MAX_SAFE_INTEGER)
          ? Number(value)
          : value.toString();

      const { signature } = await signTypedData(
        {
          domain: {
            name: INVITE_DOMAIN_NAME,
            version: INVITE_DOMAIN_VERSION,
            chainId: DEFAULT_CHAIN,
            verifyingContract: SAVING_CIRCLES_CONTRACT_ADDRESS,
          },
          types: {
            Invite: [
              { name: "id", type: "uint256" },
              { name: "nonce", type: "uint256" },
            ],
          },
          primaryType: "Invite",
          message: {
            id: toTypedDataUint(circleId),
            nonce: toTypedDataUint(candidate),
          },
        },
        { uiOptions: { showWalletUIs: false } }
      );

      const duration =
        getIntervalBySeconds(Number(depositInterval))?.label ?? "-";

      const long = buildInviteUrl(
        `${window.location.origin}/stacks/join`,
        id,
        candidate,
        signature,
        stackName,
        expectedMembers,
        duration,
        formatBalance(+formatEther(depositAmount), 2)
      );
      const short = await shortenUrl(long, { check: false });

      await decide("approve", {
        nonce: candidate.toString(),
        signature,
        short,
        long,
      });

      setApprovedLink(short);
      onDecided();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err?.message || "Failed to approve request");
    } finally {
      setBusy(null);
    }
  };

  const reject = () => {
    setModal({
      type: "REJECT_JOIN_REQUEST_WARNING",
      onConfirm: async () => {
        setBusy("rejecting");
        setError(null);

        try {
          await decide("reject");
          onDecided();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
          setError(err?.message || "Failed to reject request");
        } finally {
          setBusy(null);
        }
      },
    });
  };

  if (approvedLink) {
    return <PendingInviteLink link={approvedLink} shorten={false} />;
  }

  return (
    <div className="bg-paper-1 p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Body bold>
          {formatAddress(request.wallet_address as `0x${string}`)}
        </Body>
        <Body className="text-surface-grey text-xs">
          Requested {formatShortDate(new Date(request.requested_at))}
        </Body>
      </div>
      <div className="flex items-center justify-start gap-2">
        <LocalButton
          onClick={approve}
          leftIcon={<CheckIcon size={16} />}
          isLoading={busy === "approving"}
          disabled={busy !== null}
          className="text-sm"
        >
          Approve
        </LocalButton>
        <LocalButton
          onClick={reject}
          variant="destructive"
          leftIcon={<XIcon size={16} />}
          isLoading={busy === "rejecting"}
          disabled={busy !== null}
          className="text-sm"
        >
          Reject
        </LocalButton>
      </div>
      {error && <Body className="text-system-red text-xs">{error}</Body>}
    </div>
  );
};

export default PendingJoinRequests;
