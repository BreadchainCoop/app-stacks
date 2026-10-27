"use client";

import BalanceHint from "@/app/conditional-grants/_components/balance-hint";
import LocalButton from "@/components/button";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useConditionalGrantAction } from "@/hooks/use-conditional-grant-action";
import { conditionalGrantsAbi } from "@/lib/abis/conditional-grants";
import { CONDITIONAL_GRANT_CREATE_ERRORS } from "@/lib/contract-errors";
import { DEPOSIT_TOKEN, parseDepositAmount } from "@/lib/deposit-token";
import { agreementHash } from "@/lib/conditional-grant-terms";
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
  CoinsIcon,
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
import { ConditionalGrantFormSchemaData } from "./schema";

const SECONDS_PER_DAY = BigInt(24 * 60 * 60);

/** A form number as token base units; invalid or empty input is zero. */
const toAmount = (value: number) =>
  Number.isFinite(value) && value > 0
    ? parseDepositAmount(String(value))
    : BigInt(0);

const ConditionalGrantOverviewForm = ({ onBack }: { onBack: () => void }) => {
  const router = useRouter();
  const modal = useModal();
  const blockTimestamp = useBlockTimestamp();
  const form = useFormContext<ConditionalGrantFormSchemaData>();
  const { user } = useConnectedUser();
  const { runConditionalGrantAction, balance } = useConditionalGrantAction(
    DEPOSIT_TOKEN.address
  );

  const advance = form.watch("advance");
  const grant = form.watch("grant");
  const fee = form.watch("fee");
  const grantee = form.watch("grantee");
  const acceptBy = form.watch("acceptBy");
  const payBackDays = form.watch("payBackDays");
  const noDeadline = form.watch("noDeadline");
  const agreement = form.watch("agreement");

  const total = toAmount(advance) + toAmount(grant);
  const acceptByMs = acceptBy ? dateInputToMs(acceptBy) : NaN;

  const createGrant = (data: ConditionalGrantFormSchemaData) => {
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

    const advanceAmount = toAmount(data.advance);
    const grantAmount = toAmount(data.grant);
    const terms = {
      token: DEPOSIT_TOKEN.address,
      advance: advanceAmount,
      grant: grantAmount,
      fee: toAmount(data.fee),
      acceptBy: acceptBySeconds,
      // A period of 0 tells the contract there is no deadline
      payBackPeriod: data.noDeadline
        ? BigInt(0)
        : BigInt(data.payBackDays ?? 0) * SECONDS_PER_DAY,
      termsHash: agreementHash(data.agreement),
    };
    const granteeAddress = data.grantee
      ? (data.grantee as Address)
      : zeroAddress;

    modal.setModal({
      type: "STACK_TX_INIT",
      stackType: "conditionalGrant",
      action: "createGrant",
      id: BigInt(0),
      amount: advanceAmount + grantAmount,
      onConfirm: () =>
        runConditionalGrantAction({
          action: "createGrant",
          functionName: "create",
          args: [terms, granteeAddress],
          errors: CONDITIONAL_GRANT_CREATE_ERRORS,
          approveAmount: advanceAmount + grantAmount,
          amount: advanceAmount + grantAmount,
          onSuccess: (receipt) => {
            const [log] = parseEventLogs({
              abi: conditionalGrantsAbi,
              logs: receipt.logs,
              eventName: "GrantCreated",
            });
            if (log) {
              form.reset();
              router.push(stackTypeDetailPath("conditionalGrant", log.args.id));
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
        <Body className="text-surface-grey">
          Please review your conditional grant.
        </Body>
      </header>
      <div className="flex flex-col gap-4 pb-4 border-b border-blue-0">
        <ReviewedRow
          RIcon={UserIcon}
          title="Grantee"
          body={grantee ? formatAddress(grantee as Address) : "Add it later"}
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
          RIcon={CoinsIcon}
          title="Fee"
          body={
            Number.isFinite(fee) && fee > 0
              ? `${formatBalance(fee, 2)} ${DEPOSIT_TOKEN.symbol}`
              : "None"
          }
        />
        <ReviewedRow
          RIcon={CalendarIcon}
          title="Offer open until"
          body={Number.isNaN(acceptByMs) ? "-" : formatShortDate(acceptByMs)}
        />
        <ReviewedRow
          RIcon={HourglassIcon}
          title="Time to pay back"
          body={
            noDeadline
              ? "No deadline"
              : payBackDays !== undefined &&
                  Number.isFinite(payBackDays) &&
                  payBackDays > 0
                ? `${payBackDays} days`
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
        <Body>Advance</Body>
        <div className="p-1 shrink-0 border border-system-green">
          <Body bold>
            {Number.isFinite(advance)
              ? `${formatBalance(advance, 2)} ${DEPOSIT_TOKEN.symbol}`
              : "-"}
          </Body>
        </div>
      </div>
      <div className="px-6 py-3 bg-paper-1">
        <Body className="text-xs text-surface-grey-2">
          The advance and the grant move into escrow now. You can cancel for a
          full refund until the grantee accepts.
        </Body>
        <Body className="text-xs text-surface-grey-2">
          {noDeadline
            ? "The advance has no interest and no deadline. You can set a deadline later with at least 30 days' notice; until then the grant can't be taken back."
            : "The advance has no interest. If the grantee is late, you can give more time or take the grant back."}
        </Body>
      </div>
      <div className="flex flex-col gap-4">
        {user.status === "CONNECTED" ? (
          <>
            <LocalButton
              leftIcon={<SparkleIcon size={24} />}
              onClick={form.handleSubmit(createGrant)}
              type="submit"
              disabled={balance !== undefined && balance < total}
            >
              Offer Grant
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

export default ConditionalGrantOverviewForm;
