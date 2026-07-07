"use client";

import { ArrowRightIcon, SealCheckIcon } from "@phosphor-icons/react/ssr";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import {
  CollectiveCreationFailedModalState,
  CollectiveCreationSuccessModalState,
  useModal,
} from "../context";
import { Body, Heading2, Heading3 } from "@breadcoop/ui";
import PendingInviteLink from "@/components/pending-invite-link";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import Link from "next/link";
import LocalButton from "@/components/button";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { usePrivy, useSignTypedData } from "@privy-io/react-auth";
import { getDefaultChainId } from "@/utils/chain";
import { shortenUrl } from "@/utils/shorten";
import { SupabaseInviteLink } from "@/lib/supabase";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { clientEnv } from "@/lib/env";
import { stackMetadataId, stackTypeDetailPath } from "@/lib/stack-types";
import { formatBps } from "@/lib/asca-state";
import { formatSecondsHuman } from "@/utils/deposit-interval";

type InviteLink = {
  nonce: bigint;
  signature: string;
  url: string;
  used: boolean;
};

const INVITE_DOMAIN_NAME = "StacksInvite";
const INVITE_DOMAIN_VERSION = "1";
const DEFAULT_CHAIN = getDefaultChainId();

function buildInviteUrl(
  baseUrl: string,
  fundId: string,
  nonce: bigint,
  signature: string,
  name: string,
  members: number
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("type", "collective");
  url.searchParams.set("contract", COLLECTIVE_FUND_CONTRACT_ADDRESS);
  url.searchParams.set("circleId", fundId);
  url.searchParams.set("nonce", nonce.toString());
  url.searchParams.set("signature", signature);
  url.searchParams.set("name", name);
  url.searchParams.set("members", String(members));

  return url.toString();
}

const isLocal = clientEnv.NEXT_PUBLIC_NODE_ENV === "local";

export const CollectiveSuccessResultModal = ({
  modalState,
}: {
  modalState: CollectiveCreationSuccessModalState;
}) => {
  const blockTimestamp = useBlockTimestamp();
  const { user: privyUser } = usePrivy();
  const publicClient = usePublicClient();
  const { signTypedData } = useSignTypedData();
  const modal = useModal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signingProgress, setSigningProgress] = useState("");
  const [invites, setInvites] = useState<InviteLink[]>([]);

  const generateInvites = async () => {
    if (!publicClient) return;

    setIsGenerating(true);
    setError(null);
    setSigningProgress("Preparing invites...");

    try {
      const fundId = BigInt(modalState.fund.id);
      const inviteCount = Math.max(1, modalState.fund.members - 1);

      const supabaseInviteLinks: SupabaseInviteLink[] = [];
      // Generate unique nonces
      const invitePayloads: {
        nonce: bigint;
      }[] = [];
      let candidate = BigInt(isLocal ? blockTimestamp : Date.now());

      while (invitePayloads.length < inviteCount) {
        const alreadyUsed = await publicClient.readContract({
          address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
          abi: collectiveFundCirclesAbi,
          functionName: "usedNonces",
          args: [fundId, candidate],
        });

        if (!alreadyUsed) {
          invitePayloads.push({ nonce: candidate });
        }
        candidate += BigInt(1);
      }

      const signedInvites: InviteLink[] = [];
      const baseUrl = `${window.location.origin}/stacks/join`;

      for (let i = 0; i < invitePayloads.length; i++) {
        setSigningProgress(
          `Creating invite ${i + 1} of ${invitePayloads.length}...`
        );
        const { nonce } = invitePayloads[i];

        const fundIdNum =
          fundId < BigInt(Number.MAX_SAFE_INTEGER)
            ? Number(fundId)
            : fundId.toString();
        const nonceNum =
          nonce < BigInt(Number.MAX_SAFE_INTEGER)
            ? Number(nonce)
            : nonce.toString();

        const typedData = {
          domain: {
            name: INVITE_DOMAIN_NAME,
            version: INVITE_DOMAIN_VERSION,
            chainId: DEFAULT_CHAIN,
            verifyingContract: COLLECTIVE_FUND_CONTRACT_ADDRESS,
          },
          types: {
            Invite: [
              { name: "id", type: "uint256" },
              { name: "nonce", type: "uint256" },
            ],
          },
          primaryType: "Invite" as const,
          message: {
            id: fundIdNum,
            nonce: nonceNum,
          },
        };

        const { signature } = await signTypedData(typedData, {
          uiOptions: {
            showWalletUIs: false,
          },
        });

        const url = buildInviteUrl(
          baseUrl,
          modalState.fund.id,
          nonce,
          signature,
          modalState.fund.name,
          modalState.fund.members
        );

        supabaseInviteLinks.push({ long: url, short: "", used: false });
        signedInvites.push({ nonce, signature, url, used: false });
      }

      setSigningProgress("Shortening invite links...");

      const shorteningResults = await Promise.allSettled(
        signedInvites.map((invite) => shortenUrl(invite.url, { check: false }))
      );

      signedInvites.forEach((invite, index) => {
        const result = shorteningResults[index];
        if (result.status === "fulfilled" && result.value !== invite.url) {
          invite.url = result.value;
          supabaseInviteLinks[index].short = result.value;
        } else {
          supabaseInviteLinks[index].short = supabaseInviteLinks[index].long;
        }
      });

      fetch("/api/stacks/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stackMetadataId("collective", modalState.fund.id),
          stackname: modalState.fund.name,
          expected_members: modalState.fund.members,
          invite_links: supabaseInviteLinks,
          privyUserId: privyUser?.id,
          stackType: "collective",
        }),
      });

      setSigningProgress("");
      setInvites(signedInvites);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Invite generation failed:", err);
      setError(err?.message || "Failed to generate invite links");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    generateInvites();
  }, []);

  return (
    <ModalContainer className="max-w-142!">
      <div className="flex flex-col gap-3 items-center justify-center">
        <SealCheckIcon size={80} className="fill-system-green" />
        <Heading2 className="text-2xl leading-6">
          &quot;{modalState.fund.name}&ldquo;
        </Heading2>
        <Body className="text-surface-ink">Collective fund created!</Body>
      </div>

      <div className="*:mb-4 *:last:mb-0 border-t border-primary-blue pt-6">
        <Body>
          Your fund has 1 member (you). Invite others with a link so you can
          pool and spend money together.
        </Body>

        <section>
          <Heading3 className="mb-2 text-2xl leading-[100%]">
            Member invite links
          </Heading3>
          <div className="flex items-center justify-between mb-2">
            <Body>Pending: {modalState.fund.members - 1}</Body>
            <Body bold>Invite accepted: 0</Body>
          </div>

          {isGenerating && (
            <div className="p-4 bg-primary-blue/10 rounded-lg mb-2">
              {signingProgress && (
                <Body className="text-primary-blue">{signingProgress}</Body>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-system-warning/10 rounded-lg mb-2">
              <Body className="text-system-warning">Error: {error}</Body>
              <button
                onClick={generateInvites}
                className="mt-2 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}

          <div className="*:mb-2 *:last:mb-0 max-h-96 overflow-y-auto">
            {invites.length > 0
              ? invites.map((invite, i) => (
                  <PendingInviteLink
                    key={invite.nonce.toString()}
                    link={invite.url}
                    label={i >= 9 ? `${i + 1}` : `0${i + 1}`}
                    shorten={false}
                  />
                ))
              : !isGenerating && !error
                ? Array.from(
                    {
                      length: modalState.fund.members - 1,
                    },
                    (_, i) => i + 1
                  ).map((m) => (
                    <PendingInviteLink
                      key={m}
                      link=""
                      label={m >= 10 ? `${m}` : `0${m}`}
                    />
                  ))
                : null}
          </div>

          <Body className="text-system-warning mt-4">
            <span className="font-bold">Reminder: </span>
            <span>Each Invite is unique and can only be accepted once.</span>
          </Body>
        </section>

        <Accordion>
          <AccordionItem value="detail">
            <AccordionHeader>Fund details</AccordionHeader>
            <AccordionContent>
              <div>
                <RowDetail label="Fund name" body={modalState.fund.name} />
                <RowDetail label="Fund ID" body={modalState.fund.id} />
                <RowDetail
                  label="Voting period"
                  body={formatSecondsHuman(
                    Number(modalState.fund.votingPeriod)
                  )}
                />
                <RowDetail
                  label="Approval threshold"
                  body={`${formatBps(modalState.fund.approvalThresholdBps)}% of members`}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <LocalButton
        as={Link}
        href={stackTypeDetailPath("collective", modalState.fund.id)}
        className="w-full"
        onClick={() => modal.setModal(null)}
        rightIcon={<ArrowRightIcon size={24} />}
      >
        Visit fund detail page
      </LocalButton>
      <Body className="text-surface-grey-2">
        Note: You can also access your member invite links through your fund
        detail page.
      </Body>
    </ModalContainer>
  );
};

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

export const CollectiveFailedResultModal = ({
  modalState,
}: {
  modalState: CollectiveCreationFailedModalState;
}) => {
  return (
    <ModalContainer status="error">
      <ModalHeader title="Fund Creation Failed"></ModalHeader>
      <ModalStatus
        status="error"
        msg={modalState.msg || "Unable to create fund"}
      />
    </ModalContainer>
  );
};
