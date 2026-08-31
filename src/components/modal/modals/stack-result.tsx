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
import LocalButton from "@/components/button";
import { useEffect, useRef, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { shortenUrl } from "@/utils/shorten";

export function buildInviteUrl(baseUrl: string, circleId: string): string {
  const url = new URL(baseUrl);
  url.searchParams.set("circleId", circleId);

  return url.toString();
}

export const StackSuccessResultModal = ({
  modalState,
}: {
  modalState: StackInitSuccessModalState;
}) => {
  const { user: privyUser } = usePrivy();
  const modal = useModal();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generalInviteUrl, setGeneralInviteUrl] = useState("");
  const hasStartedRef = useRef(false);

  const createInviteLink = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const baseUrl = `${window.location.origin}/stacks/join`;
      const url = buildInviteUrl(baseUrl, modalState.circle.id);

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
          id: modalState.circle.id,
          stackname: modalState.circle.name,
          expected_members: modalState.circle.members,
          privyUserId: privyUser?.id,
        }),
      });

      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to save stack metadata");
      }

      setGeneralInviteUrl(shortUrl);
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
    // effect, which would otherwise POST the same on-chain circle id twice
    // and hit stacks_metadata's unique constraint on the second call. Doesn't
    // affect the manual "Retry" button below, which calls createInviteLink
    // directly.
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    createInviteLink();
  }, []);

  return (
    <ModalContainer className="max-w-142!">
      <div className="flex flex-col gap-3 items-center justify-center">
        <SealCheckIcon size={80} className="fill-system-green" />
        <Heading2 className="text-2xl leading-6">
          &quot;{modalState.circle.name}&ldquo;
        </Heading2>
        <Body className="text-surface-ink">Your Stack is ready!</Body>
      </div>

      <div className="*:mb-4 *:last:mb-0 border-t border-primary-blue pt-6">
        <Body>
          Your Stack has 1 member (you). Share the invite link below to invite
          members. You can remove members you don&apos;t recognize before
          launching the Stack.
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

          {generalInviteUrl && (
            <PendingInviteLink
              link={generalInviteUrl}
              label="Invite link"
              shorten={false}
            />
          )}

          <Body className="text-surface-grey-2 mt-4">
            Anyone with this link can join your Stack. You can manage members on
            your Stack page before launching.
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
                  body={`$${formatBalance(modalState.circle.deposit, 2)}`}
                />
                <RowDetail
                  label="Stack goal"
                  body={`$${formatBalance(modalState.circle.total, 2)}`}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
      <LocalButton
        as={Link}
        href={`/stacks/${modalState.circle.id}?name=${modalState.circle.name}`}
        className="w-full"
        onClick={() => modal.setModal(null)}
        rightIcon={<ArrowRightIcon size={24} />}
      >
        Visit stacks detail page
      </LocalButton>
      <Body className="text-surface-grey-2">
        Note: You can always find the invite link on your Stack page.
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
