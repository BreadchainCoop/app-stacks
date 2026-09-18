"use client";

import { ArrowRightIcon, SealCheckIcon } from "@phosphor-icons/react/ssr";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import {
  GoalCreationFailedModalState,
  GoalCreationSuccessModalState,
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
import LocalButton from "@/components/button";
import { useEffect, useRef, useState } from "react";
import { useUserIdentity } from "@/components/providers/user-identity";
import { shortenUrl } from "@/utils/shorten";
import { stackMetadataId, stackTypeDetailPath } from "@/lib/stack-types";
import { formatAddress } from "@/utils/address";
import { formatShortDate } from "@/utils/time";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";

export function buildInviteUrl(baseUrl: string, goalId: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("type", "goal");
  url.searchParams.set("circleId", goalId);

  return url.toString();
}

export const GoalSuccessResultModal = ({
  modalState,
}: {
  modalState: GoalCreationSuccessModalState;
}) => {
  const { userId } = useUserIdentity();
  const modal = useModal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState("");
  const hasStartedRef = useRef(false);

  const createInviteLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const baseUrl = `${window.location.origin}/stacks/join`;
      const url = buildInviteUrl(baseUrl, modalState.goal.id);

      let shortUrl = url;
      try {
        shortUrl = await shortenUrl(url, { check: false });
      } catch {
        shortUrl = url;
      }

      const res = await fetch("/api/stacks/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: stackMetadataId("goal", modalState.goal.id),
          stackname: modalState.goal.name,
          expected_members: modalState.goal.members,
          privyUserId: userId,
        }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to save goal metadata");
      }

      setInviteUrl(shortUrl);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Invite link creation failed:", err);
      setError(err?.message || "Failed to create invite link");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Guards against React Strict Mode's dev-only double-invocation of this
    // effect, which would POST the same goal id twice.
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    createInviteLink();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ModalContainer className="max-w-142!">
      <div className="flex flex-col gap-3 items-center justify-center">
        <SealCheckIcon size={80} className="fill-system-green" />
        <Heading2 className="text-2xl leading-6">
          &quot;{modalState.goal.name}&ldquo;
        </Heading2>
        <Body className="text-surface-ink">Your Shared Goal is ready!</Body>
      </div>

      <div className="*:mb-4 *:last:mb-0 border-t border-primary-blue pt-6">
        <Body>
          Your goal has 1 member (you). Share the invite link below; people who
          open it can request to join, and you add them from the goal page.
        </Body>

        <section>
          <Heading3 className="mb-2 text-2xl leading-[100%]">
            Invite link
          </Heading3>

          {isGenerating && (
            <div className="p-4 bg-primary-blue/10 rounded-lg mb-2">
              <Body className="text-primary-blue">Creating invite link...</Body>
            </div>
          )}

          {error && (
            <div className="p-4 bg-system-warning/10 rounded-lg mb-2">
              <Body className="text-system-warning">Error: {error}</Body>
              <button
                onClick={createInviteLink}
                className="mt-2 text-sm underline"
              >
                Retry
              </button>
            </div>
          )}

          {inviteUrl && (
            <PendingInviteLink
              link={inviteUrl}
              label="Invite link"
              shorten={false}
            />
          )}
        </section>

        <Accordion>
          <AccordionItem value="detail">
            <AccordionHeader>Goal details</AccordionHeader>
            <AccordionContent>
              <div>
                <RowDetail label="Goal name" body={modalState.goal.name} />
                <RowDetail label="Goal ID" body={modalState.goal.id} />
                <RowDetail
                  label="Goal amount"
                  body={`${formatBalance(
                    +formatDepositAmount(modalState.goal.goalAmount),
                    2
                  )} ${DEPOSIT_TOKEN.symbol}`}
                />
                <RowDetail
                  label="Deadline"
                  body={formatShortDate(
                    Number(modalState.goal.deadline) * 1000
                  )}
                />
                <RowDetail
                  label="Beneficiary"
                  body={
                    modalState.goal.beneficiary
                      ? formatAddress(modalState.goal.beneficiary)
                      : "None — members reclaim their share"
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <LocalButton
        as={Link}
        href={stackTypeDetailPath("goal", modalState.goal.id)}
        className="w-full"
        onClick={() => modal.setModal(null)}
        rightIcon={<ArrowRightIcon size={24} />}
      >
        Visit goal detail page
      </LocalButton>
      <Body className="text-surface-grey-2">
        Note: You can always find the invite link on your goal page.
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

export const GoalFailedResultModal = ({
  modalState,
}: {
  modalState: GoalCreationFailedModalState;
}) => {
  return (
    <ModalContainer status="error">
      <ModalHeader title="Goal Creation Failed"></ModalHeader>
      <ModalStatus
        status="error"
        msg={modalState.msg || "Unable to create goal"}
      />
    </ModalContainer>
  );
};
