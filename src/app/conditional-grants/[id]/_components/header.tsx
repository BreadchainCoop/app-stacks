"use client";

import Alert from "@/components/alert";
import BackPage from "@/components/back-page";
import LocalButton from "@/components/button";
import {
  GRANT_STATE_CHIP_CLASSES,
  GRANT_STATE_LABELS,
  GrantState,
} from "@/lib/conditional-grant-state";
import { Chip, cn, Heading2, useCopyToClipboard } from "@breadcoop/ui";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { GrantRole } from "./page-content";

function CopyGrantLink({ id }: { id: string }) {
  const [origin, setOrigin] = useState("");
  const { copy, copied } = useCopyToClipboard({
    textToCopy: `${origin}/conditional-grants/${id}`,
  });

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  return (
    <LocalButton
      variant="light"
      className={cn("h-8 border px-4", copied && "text-system-green")}
      leftIcon={
        copied ? (
          <CheckIcon className="fill-system-green" />
        ) : (
          <CopyIcon className="fill-primary-blue" />
        )
      }
      onClick={() => copy()}
      disabled={!origin}
    >
      {copied ? "Copied!" : "Copy link"}
    </LocalButton>
  );
}

function stateAlert(
  state: GrantState,
  role: GrantRole,
  noDeadline: boolean,
  feeDue: bigint
) {
  switch (state) {
    case GrantState.Offered:
      return {
        title: "Waiting for the grantee",
        description:
          role === "grantee"
            ? "This conditional grant is offered to you. The advance and the grant are already in escrow. Accept below to receive the advance."
            : "The advance and the grant are in escrow. The grantee can accept until the offer closes.",
      };
    case GrantState.Expired:
      return {
        title: "The offer expired",
        description:
          "The grantee didn't accept in time. The grantor can cancel to get the escrow back.",
      };
    case GrantState.Cancelled:
      return {
        title: "This offer was cancelled",
        description: "The grantor cancelled the offer and got the escrow back.",
      };
    case GrantState.Active:
      return {
        title: "Paying back the advance",
        description: noDeadline
          ? "There's no deadline. Pay any amount whenever you like; once the full advance is paid back, the grant unlocks. The grantor can set a deadline, but only at least 30 days out."
          : "Pay back before the deadline to unlock the grant. Pay any amount whenever you like until then.",
      };
    case GrantState.Overdue:
      return {
        title: "Payment is late",
        description:
          "The deadline has passed. The grantee can still pay back and receive the grant. The grantor can give more time, or take the grant back starting 7 days after the deadline.",
      };
    case GrantState.PaidBack:
      return {
        title: "Advance paid back!",
        description:
          feeDue > BigInt(0)
            ? "The advance is paid back and the grant has unlocked. The grantee can pay the fee to receive the full grant, or release it now with the fee taken out."
            : "The advance is fully paid back. The grant can now be released to the grantee.",
      };
    case GrantState.Completed:
      return {
        title: "Completed",
        description:
          "The advance was paid back and the grant (if any) was paid out.",
      };
    case GrantState.Defaulted:
      return {
        title: "The grant was taken back",
        description:
          "The advance was late and the grantor reclaimed the grant. Any remaining advance can still be paid back.",
      };
  }
}

const SUCCESS_STATES = [GrantState.PaidBack, GrantState.Completed];

const GrantHeader = ({
  id,
  role,
  state,
  noDeadline,
  feeDue,
}: {
  id: string;
  role: GrantRole;
  state: GrantState | undefined;
  noDeadline: boolean;
  /** Fee still unpaid after the grant unlocked; it comes out of the grant on release */
  feeDue: bigint;
}) => {
  const alert =
    state !== undefined ? stateAlert(state, role, noDeadline, feeDue) : null;

  return (
    <header className="flex flex-col mb-3.5 md:mb-6">
      <div className="flex flex-col items-start gap-2.5 mb-4 md:flex-row md:items-center md:justify-between md:flex-wrap">
        <BackPage label="Return to Dashboard" href="/" className="m-0!" />
        <CopyGrantLink id={id} />
      </div>
      <div className="flex flex-col flex-wrap gap-4 mb-5.25 sm:flex-row sm:items-center sm:justify-between md:order-first md:mb-7.25">
        <Heading2 className="text-primary-blue text-2xl md:text-5xl">
          Conditional grant {id}
        </Heading2>
        <div className="flex items-center gap-2">
          {role && (
            <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current capitalize">
              {role}
            </Chip>
          )}
          {state !== undefined && (
            <Chip
              className={cn(
                "bg-paper-main max-w-max hover:border-current",
                GRANT_STATE_CHIP_CLASSES[state]
              )}
            >
              {GRANT_STATE_LABELS[state]}
            </Chip>
          )}
        </div>
      </div>
      {alert && state !== undefined && (
        <Alert
          closeAble={false}
          variant={SUCCESS_STATES.includes(state) ? "success" : "warning"}
          title={alert.title}
          description={alert.description}
        />
      )}
    </header>
  );
};

export default GrantHeader;
