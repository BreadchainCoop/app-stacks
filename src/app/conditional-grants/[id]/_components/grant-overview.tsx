"use client";

import AgreementText from "@/app/conditional-grants/_components/agreement-text";
import Countdown from "@/components/countdown";
import { GrantStatus, GrantTerms } from "@/hooks/use-conditional-grant";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { GrantState, paidBackPercent } from "@/lib/conditional-grant-state";
import { formatAddress } from "@/utils/address";
import { formatShortDate } from "@/utils/time";
import { Body, formatBalance, Heading3, Logo } from "@breadcoop/ui";
import Link from "next/link";
import { ReactNode } from "react";
import { zeroAddress } from "viem";

const GrantOverview = ({
  grantId,
  terms,
  status,
  state,
  outstanding,
}: {
  grantId: bigint;
  terms: GrantTerms;
  status: GrantStatus;
  state: GrantState;
  outstanding: bigint;
}) => {
  const accepted = status.acceptedAt > BigInt(0);
  const percentage = paidBackPercent(
    status.paidBack,
    terms.advance + terms.fee
  );
  // Past the deadline a countdown only reads "0 days"; the banner explains it
  const payingBack = state === GrantState.Active;
  const noDeadline = status.payBackBy === BigInt(0);

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <Heading3 className="text-2xl shrink-0">Overview</Heading3>
        <Body bold className="text-xs shrink-0">
          <span className="font-normal">ID: </span>
          <span>{grantId.toString()}</span>
        </Body>
      </header>
      {accepted && (
        <div className="border-b border-paper-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <Body bold>Paid back</Body>
            <Body bold>{percentage}%</Body>
          </div>
          <div className="w-full h-3.5 p-0.75 bg-paper-main">
            <div
              className="h-full bg-primary-blue"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 border-b border-paper-2 pb-4">
        <Amount label="Advance" amount={terms.advance} />
        <Amount label="Grant on pay-back" amount={terms.grant} />
        {terms.fee > BigInt(0) && <Amount label="Fee" amount={terms.fee} />}
        {accepted && <Amount label="Paid back" amount={status.paidBack} />}
        {accepted && <Amount label="Still owed" amount={outstanding} />}
      </div>
      <div>
        {accepted ? (
          <>
            <BreakdownRow label="Pay back by">
              <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
                {noDeadline
                  ? "No deadline"
                  : formatShortDate(Number(status.payBackBy) * 1000)}
              </p>
            </BreakdownRow>
            {payingBack && !noDeadline && (
              <BreakdownRow label="Time left">
                <Countdown targetSeconds={Number(status.payBackBy)} />
              </BreakdownRow>
            )}
          </>
        ) : (
          <>
            <BreakdownRow label="Offer open until">
              <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
                {formatShortDate(Number(terms.acceptBy) * 1000)}
              </p>
            </BreakdownRow>
            <BreakdownRow label="Time to pay back">
              <p>
                {terms.payBackPeriod === BigInt(0)
                  ? "No deadline (the grantor can set one with 30 days' notice)"
                  : `${Number(terms.payBackPeriod / BigInt(86400))} days after accepting`}
              </p>
            </BreakdownRow>
          </>
        )}
        <BreakdownRow label="Grantor">
          <AddressLink address={status.grantor} />
        </BreakdownRow>
        <BreakdownRow label="Grantee">
          {status.grantee === zeroAddress ? (
            <p>Not set yet</p>
          ) : (
            <AddressLink address={status.grantee} />
          )}
        </BreakdownRow>
        {terms.agreement ? (
          <div className="bg-paper-1 py-2 px-4 flex flex-col gap-2.5 mb-2 last:mb-0">
            <Body className="text-surface-grey-2">Agreement</Body>
            <AgreementText text={terms.agreement} />
          </div>
        ) : (
          <BreakdownRow label="Agreement">
            <p>None</p>
          </BreakdownRow>
        )}
      </div>
    </section>
  );
};

function Amount({ label, amount }: { label: string; amount: bigint }) {
  return (
    <Body className="flex flex-col justify-start">
      <span className="text-surface-grey">{label}</span>
      <span className="inline-flex items-center justify-start">
        <Logo size={24} variant="square" className="mr-1" />
        <span className="font-bold mt-[0.2rem]">
          {formatBalance(+formatDepositAmount(amount), 2)}{" "}
          {DEPOSIT_TOKEN.symbol}
        </span>
      </span>
    </Body>
  );
}

function AddressLink({ address }: { address: `0x${string}` }) {
  return (
    <Link href={`/account/${address}`} className="hover:text-primary-blue">
      {formatAddress(address)}
    </Link>
  );
}

function BreakdownRow({
  label,
  children,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="bg-paper-1 py-2 px-4 flex flex-col gap-2.5 mb-2 last:mb-0 md:flex-row md:justify-between">
      <Body className="text-surface-grey-2 capitalize">{label}</Body>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

export default GrantOverview;
