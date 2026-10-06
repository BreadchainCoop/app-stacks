"use client";

import BalanceHint from "@/app/microloans/_components/balance-hint";
import LocalButton from "@/components/button";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useMicroloanAction } from "@/hooks/use-microloan-action";
import { microloansAbi } from "@/lib/abis/microloans";
import { MICROLOAN_CREATE_ERRORS } from "@/lib/contract-errors";
import { DEPOSIT_TOKEN, parseDepositAmount } from "@/lib/deposit-token";
import { agreementHash } from "@/lib/microloan-terms";
import { stackTypeDetailPath } from "@/lib/stack-types";
import { formatAddress } from "@/utils/address";
import { dateInputToMs, formatShortDate } from "@/utils/time";
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
  FileTextIcon,
  GiftIcon,
  HourglassIcon,
  Icon,
  SparkleIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useModal } from "@/components/modal/context";
import { useRouter } from "next/navigation";
import { useFormContext } from "react-hook-form";
import { Address, parseEventLogs, zeroAddress } from "viem";
import { MicroloanFormSchemaData } from "./schema";

const SECONDS_PER_DAY = BigInt(24 * 60 * 60);

/** A form number as token base units; invalid or empty input is zero. */
const toAmount = (value: number) =>
  Number.isFinite(value) && value > 0
    ? parseDepositAmount(String(value))
    : BigInt(0);

const MicroloanOverviewForm = ({ onBack }: { onBack: () => void }) => {
  const router = useRouter();
  const modal = useModal();
  const blockTimestamp = useBlockTimestamp();
  const form = useFormContext<MicroloanFormSchemaData>();
  const { user } = useConnectedUser();
  const { runMicroloanAction, balance } = useMicroloanAction(
    DEPOSIT_TOKEN.address
  );

  const principal = form.watch("principal");
  const grant = form.watch("grant");
  const borrower = form.watch("borrower");
  const acceptBy = form.watch("acceptBy");
  const repaymentDays = form.watch("repaymentDays");
  const agreement = form.watch("agreement");

  const total = toAmount(principal) + toAmount(grant);
  const acceptByMs = acceptBy ? dateInputToMs(acceptBy) : NaN;

  const createLoan = (data: MicroloanFormSchemaData) => {
    // A date input yields YYYY-MM-DD; the offer closes at midnight at the
    // start of that date, in the user's own timezone.
    const acceptBySeconds = BigInt(
      Math.floor(dateInputToMs(data.acceptBy) / 1000)
    );

    // Pre-check against block time (never Date.now — local Anvil warps time)
    if (acceptBySeconds <= BigInt(Math.floor(blockTimestamp / 1000))) {
      form.setError("acceptBy", { message: "The date must be in the future" });
      return;
    }

    const loanPrincipal = toAmount(data.principal);
    const loanGrant = toAmount(data.grant);
    const terms = {
      token: DEPOSIT_TOKEN.address,
      vault: zeroAddress,
      principal: loanPrincipal,
      grant: loanGrant,
      acceptBy: acceptBySeconds,
      repaymentPeriod: BigInt(data.repaymentDays) * SECONDS_PER_DAY,
      termsHash: agreementHash(data.agreement),
    };
    const borrowerAddress = data.borrower
      ? (data.borrower as Address)
      : zeroAddress;

    modal.setModal({
      type: "STACK_TX_INIT",
      stackType: "microloan",
      action: "createLoan",
      id: BigInt(0),
      amount: loanPrincipal + loanGrant,
      onConfirm: () =>
        runMicroloanAction({
          action: "createLoan",
          functionName: "create",
          args: [terms, borrowerAddress],
          errors: MICROLOAN_CREATE_ERRORS,
          approveAmount: loanPrincipal + loanGrant,
          amount: loanPrincipal + loanGrant,
          onSuccess: (receipt) => {
            const [log] = parseEventLogs({
              abi: microloansAbi,
              logs: receipt.logs,
              eventName: "LoanCreated",
            });
            if (log) {
              form.reset();
              router.push(stackTypeDetailPath("microloan", log.args.id));
            }
          },
        }),
    });
  };

  return (
    <section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26] lg:bg-paper-main lg:border lg:border-blue-0">
      <header>
        <Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
          Overview
        </Heading3>
        <Body className="text-surface-grey">Please review your loan.</Body>
      </header>
      <div className="flex flex-col gap-4 pb-4 border-b border-blue-0">
        <ReviewedRow
          RIcon={UserIcon}
          title="Borrower"
          body={borrower ? formatAddress(borrower as Address) : "Add it later"}
        />
        <ReviewedRow
          RIcon={GiftIcon}
          title="Grant"
          body={
            Number.isFinite(grant)
              ? `${formatBalance(grant, 2)} ${DEPOSIT_TOKEN.symbol}`
              : "-"
          }
        />
        <ReviewedRow
          RIcon={CalendarIcon}
          title="Offer open until"
          body={Number.isNaN(acceptByMs) ? "-" : formatShortDate(acceptByMs)}
        />
        <ReviewedRow
          RIcon={HourglassIcon}
          title="Time to repay"
          body={
            Number.isFinite(repaymentDays) && repaymentDays > 0
              ? `${repaymentDays} days`
              : "-"
          }
        />
        <ReviewedRow
          RIcon={FileTextIcon}
          title="Agreement"
          body={agreement?.trim() ? "Attached" : "None"}
        />
      </div>
      <div className="flex items-center justify-between">
        <Body>Loan amount</Body>
        <div className="p-1 shrink-0 border border-system-green">
          <Body bold>
            {Number.isFinite(principal)
              ? `${formatBalance(principal, 2)} ${DEPOSIT_TOKEN.symbol}`
              : "-"}
          </Body>
        </div>
      </div>
      <div className="px-6 py-3 bg-paper-1">
        <Body className="text-xs text-surface-grey-2">
          The loan amount and the grant move into escrow now. You can cancel for
          a full refund until the borrower accepts.
        </Body>
        <Body className="text-xs text-surface-grey-2">
          The loan has no interest. If the borrower is late, you can give more
          time or take the grant back.
        </Body>
      </div>
      <div className="flex flex-col gap-4">
        {user.status === "CONNECTED" ? (
          <>
            <LocalButton
              leftIcon={<SparkleIcon size={24} />}
              onClick={form.handleSubmit(createLoan)}
              type="submit"
              disabled={balance !== undefined && balance < total}
            >
              Offer Loan
            </LocalButton>
            <BalanceHint balance={balance} amount={total} />
          </>
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
}: {
  RIcon: Icon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center justify-start gap-2">
        <RIcon size={24} className="fill-primary-blue" />
        <Body className="text-surface-grey-2">{title}</Body>
      </div>
      <Body bold className="text-surface-ink">
        {body}
      </Body>
    </div>
  );
}

export default MicroloanOverviewForm;
