"use client";

import { ArrowRightIcon, SealCheckIcon } from "@phosphor-icons/react/ssr";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import {
  StackInitFailedModalState,
  StackInitSuccessModalState,
  useModal,
} from "../context";
import { Body, formatBalance, Heading2, Heading3 } from "@breadcoop/ui";
import PendingInviteLink from "@/components/pending-invite-link";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
} from "@/components/accordion";
import Link from "next/link";
import LocalLiftedButton from "@/components/lifted-button";
import { useEffect, useState } from "react";
import { usePublicClient } from "wagmi";
import { savingCirclesAbi } from "../../../lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "../../../lib/constants";
import { usePrivy, useSignTypedData } from "@privy-io/react-auth";
import { getDefaultChainId } from "@/utils/chain";
import { shortenUrl } from "@/utils/shorten";
import { SupabaseInviteLink } from "@/lib/supabase";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { clientEnv } from "@/lib/env";

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
  circleId: string,
  nonce: bigint,
  signature: string,
  name: string,
  members: number,
  interval: string,
  deposit: string
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("contract", SAVING_CIRCLES_CONTRACT_ADDRESS);
  url.searchParams.set("circleId", circleId);
  url.searchParams.set("nonce", nonce.toString());
  url.searchParams.set("signature", signature);
  url.searchParams.set("name", name);
  url.searchParams.set("members", String(members));
  url.searchParams.set("interval", interval);
  url.searchParams.set("deposit", deposit);

  return url.toString();
}

const isLocal = clientEnv.NEXT_PUBLIC_NODE_ENV === "local";

export const StackSuccessResultModal = ({
  modalState,
}: {
  modalState: StackInitSuccessModalState;
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
      const circleId = BigInt(modalState.circle.id);
      const inviteCount = Math.max(1, modalState.circle.members - 1);

      const supabaseInviteLinks: SupabaseInviteLink[] = [];
      // Generate unique nonces
      const invitePayloads: {
        nonce: bigint;
      }[] = [];
      let candidate = BigInt(isLocal ? blockTimestamp : Date.now());

      while (invitePayloads.length < inviteCount) {
        const alreadyUsed = await publicClient.readContract({
          address: SAVING_CIRCLES_CONTRACT_ADDRESS,
          abi: savingCirclesAbi,
          functionName: "usedNonces",
          args: [circleId, candidate],
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

        const circleIdNum =
          circleId < BigInt(Number.MAX_SAFE_INTEGER)
            ? Number(circleId)
            : circleId.toString();
        const nonceNum =
          nonce < BigInt(Number.MAX_SAFE_INTEGER)
            ? Number(nonce)
            : nonce.toString();

        const typedData = {
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
          primaryType: "Invite" as const,
          message: {
            id: circleIdNum,
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
          modalState.circle.id,
          nonce,
          signature,
          modalState.circle.name,
          modalState.circle.members,
          modalState.circle.duration.split(" ")[1],
          formatBalance(modalState.circle.deposit, 2)
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
          id: modalState.circle.id,
          stackname: modalState.circle.name,
          expected_members: modalState.circle.members,
          invite_links: supabaseInviteLinks,
          privyUserId: privyUser?.id,
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
          &quot;{modalState.circle.name}&ldquo;
        </Heading2>
        <Body className="text-surface-ink">Stacks group created!</Body>
      </div>

      <div className="*:mb-4 *:last:mb-0 border-t border-primary-blue pt-6">
        <Body>
          Your Stacks has 1 member (you). Invite others with a link. To deposit,
          it needs 2 or more members.
        </Body>

        <section>
          <Heading3 className="mb-2 text-2xl leading-[100%]">
            Member invite links
          </Heading3>
          <div className="flex items-center justify-between mb-2">
            <Body>Pending: {modalState.circle.members - 1}</Body>
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

          <div className="*:mb-2 *:last:mb-0">
            {invites.length > 0
              ? invites.map((invite, i) => (
                  <PendingInviteLink
                    key={invite.nonce.toString()}
                    link={invite.url}
                    label={`0${i + 1}`}
                    shorten={false}
                  />
                ))
              : !isGenerating && !error
                ? Array.from(
                    {
                      length: modalState.circle.members - 1,
                    },
                    (_, i) => i + 1
                  ).map((m) => (
                    <PendingInviteLink key={m} link="" label={`0${m}`} />
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
            <AccordionHeader>Stacks details</AccordionHeader>
            <AccordionContent>
              <div>
                <RowDetail label="Group name" body={modalState.circle.name} />
                <RowDetail
                  label="Stacks group ID"
                  body={modalState.circle.id}
                />
                <RowDetail label="Duration" body={modalState.circle.duration} />
                <RowDetail
                  label="Est. Deposit amount"
                  body={`${formatBalance(modalState.circle.deposit, 2)} BREAD`}
                />
                <RowDetail
                  label="Stack goal"
                  body={`${formatBalance(modalState.circle.total, 2)} BREAD`}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <Link
        href={`/stacks/${modalState.circle.id}?name=${modalState.circle.name}`}
        className="lifted-button-container block"
        onClick={() => modal.setModal(null)}
      >
        <LocalLiftedButton rightIcon={<ArrowRightIcon size={24} />}>
          Visit stacks detail page
        </LocalLiftedButton>
      </Link>
      <Body className="text-surface-grey-2">
        Note: You can also access your member invite links through your Stacks
        details page.
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

export const StackFailedResultModal = ({
  modalState,
}: {
  modalState: StackInitFailedModalState;
}) => {
  return (
    <ModalContainer status="error">
      <ModalHeader title="Stack Creation Failed"></ModalHeader>
      <ModalStatus
        status="error"
        msg={modalState.msg || "Unable to create stack"}
      />
    </ModalContainer>
  );
};
