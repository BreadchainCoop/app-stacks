"use client";

import Alert from "@/components/alert";
import BackPage from "@/components/back-page";
import LocalButton from "@/components/button";
import {
  LOAN_STATE_CHIP_CLASSES,
  LOAN_STATE_LABELS,
  LoanState,
} from "@/lib/microloan-state";
import { Chip, cn, Heading2, useCopyToClipboard } from "@breadcoop/ui";
import { CheckIcon, CopyIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import type { LoanRole } from "./page-content";

function CopyLoanLink({ id }: { id: string }) {
  const [origin, setOrigin] = useState("");
  const { copy, copied } = useCopyToClipboard({
    textToCopy: `${origin}/microloans/${id}`,
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
      {copied ? "Copied!" : "Copy loan link"}
    </LocalButton>
  );
}

function stateAlert(state: LoanState, role: LoanRole) {
  switch (state) {
    case LoanState.Offered:
      return {
        title: "Waiting for the borrower",
        description:
          role === "borrower"
            ? "This loan is offered to you. The loan amount and the grant are already in escrow. Accept below to receive the loan."
            : "The loan amount and the grant are in escrow. The borrower can accept until the offer closes.",
      };
    case LoanState.Expired:
      return {
        title: "The offer expired",
        description:
          "The borrower didn't accept in time. The lender can cancel to get the escrow back.",
      };
    case LoanState.Cancelled:
      return {
        title: "This loan was cancelled",
        description: "The lender cancelled the offer and got the escrow back.",
      };
    case LoanState.Active:
      return {
        title: "Loan in progress",
        description:
          "Repay the full loan before the deadline to unlock the grant. Any amount can be repaid at any time.",
      };
    case LoanState.Overdue:
      return {
        title: "Repayment is late",
        description:
          "The deadline has passed. The borrower can still repay and receive the grant until the lender takes it back or gives more time.",
      };
    case LoanState.Repaid:
      return {
        title: "Loan repaid!",
        description:
          "The loan is fully repaid. The grant can now be released to the borrower.",
      };
    case LoanState.Completed:
      return {
        title: "Loan completed",
        description: "The loan was repaid and the grant (if any) was paid out.",
      };
    case LoanState.Defaulted:
      return {
        title: "The grant was taken back",
        description:
          "The loan was late and the lender reclaimed the grant. Any remaining loan amount can still be repaid.",
      };
  }
}

const SUCCESS_STATES = [LoanState.Repaid, LoanState.Completed];

const LoanHeader = ({
  id,
  role,
  state,
}: {
  id: string;
  role: LoanRole;
  state: LoanState | undefined;
}) => {
  const alert = state !== undefined ? stateAlert(state, role) : null;

  return (
    <header className="flex flex-col mb-3.5 md:mb-6">
      <div className="flex flex-col items-start gap-2.5 mb-4 md:flex-row md:items-center md:justify-between md:flex-wrap">
        <BackPage label="Return to Dashboard" href="/" className="m-0!" />
        <CopyLoanLink id={id} />
      </div>
      <div className="flex flex-col flex-wrap gap-4 mb-5.25 sm:flex-row sm:items-center sm:justify-between md:order-first md:mb-7.25">
        <Heading2 className="text-primary-blue text-2xl md:text-5xl">
          Microloan {id}
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
                LOAN_STATE_CHIP_CLASSES[state]
              )}
            >
              {LOAN_STATE_LABELS[state]}
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

export default LoanHeader;
