"use client";

import Countdown from "@/components/countdown";
import { LoanStatus, LoanTerms } from "@/hooks/use-microloan";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { LoanState, loanRepaidPercent } from "@/lib/microloan-state";
import { formatAddress } from "@/utils/address";
import { formatShortDate } from "@/utils/time";
import { Body, formatBalance, Heading3, Logo } from "@breadcoop/ui";
import Link from "next/link";
import { ReactNode } from "react";
import { zeroAddress, zeroHash } from "viem";

const LoanOverview = ({
  loanId,
  terms,
  status,
  state,
  outstanding,
}: {
  loanId: bigint;
  terms: LoanTerms;
  status: LoanStatus;
  state: LoanState;
  outstanding: bigint;
}) => {
  const accepted = status.acceptedAt > BigInt(0);
  const percentage = loanRepaidPercent(status.repaid, status.disbursed);
  const repaying = state === LoanState.Active || state === LoanState.Overdue;

  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <Heading3 className="text-2xl shrink-0">Loan overview</Heading3>
        <Body bold className="text-xs shrink-0">
          <span className="font-normal">ID: </span>
          <span>{loanId.toString()}</span>
        </Body>
      </header>
      {accepted && (
        <div className="border-b border-paper-2 pb-4">
          <div className="flex items-center justify-between mb-2">
            <Body bold>Repaid</Body>
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
        <Amount label="Loan amount" amount={terms.principal} />
        <Amount label="Grant on repayment" amount={terms.grant} />
        {accepted && <Amount label="Repaid" amount={status.repaid} />}
        {accepted && <Amount label="Still owed" amount={outstanding} />}
      </div>
      <div>
        {accepted ? (
          <>
            <BreakdownRow label="Repay by">
              <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
                {formatShortDate(Number(status.repayBy) * 1000)}
              </p>
            </BreakdownRow>
            {repaying && (
              <BreakdownRow label="Time left">
                <Countdown targetSeconds={Number(status.repayBy)} />
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
            <BreakdownRow label="Time to repay">
              <p>
                {Number(terms.repaymentPeriod / BigInt(86400))} days after
                accepting
              </p>
            </BreakdownRow>
          </>
        )}
        <BreakdownRow label="Lender">
          <AddressLink address={status.lender} />
        </BreakdownRow>
        <BreakdownRow label="Borrower">
          {status.borrower === zeroAddress ? (
            <p>Not set yet</p>
          ) : (
            <AddressLink address={status.borrower} />
          )}
        </BreakdownRow>
        <BreakdownRow label="Agreement">
          <p>
            {terms.termsHash === zeroHash
              ? "None"
              : "Attached (shared with the borrower)"}
          </p>
        </BreakdownRow>
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

export default LoanOverview;
