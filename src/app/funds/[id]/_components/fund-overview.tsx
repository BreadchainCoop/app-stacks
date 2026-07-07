"use client";

import { CollectiveFund } from "@/hooks/use-collective-fund";
import { formatBps } from "@/lib/asca-state";
import { formatAddress } from "@/utils/address";
import { formatSecondsHuman } from "@/utils/deposit-interval";
import { Body, formatBalance, Heading3, Logo } from "@breadcoop/ui";
import Link from "next/link";
import { ReactNode } from "react";
import { formatEther } from "viem";

const FundOverview = ({
  fundId,
  fund,
}: {
  fundId: bigint;
  fund: CollectiveFund;
}) => {
  return (
    <section className="bg-paper-0 p-5 *:mb-4 last:mb-0">
      <header className="flex items-center justify-between flex-wrap gap-2">
        <Heading3 className="text-2xl shrink-0">Fund overview</Heading3>
        <Body bold className="text-xs shrink-0">
          <span className="font-normal">ID: </span>
          <span>{fundId.toString()}</span>
        </Body>
      </header>
      <div className="flex flex-col gap-4 border-b border-paper-2 pb-4 md:flex-row md:justify-between">
        <PoolBalance
          label="Pool balance"
          amount={fund.poolBalance}
          className="md:items-start"
        />
        <PoolBalance
          label="Total shares"
          amount={fund.totalShares}
          className="md:justify-end md:items-end"
          unit="Shares"
        />
      </div>
      <div>
        <BreakdownRow label="Voting period">
          <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
            {formatSecondsHuman(Number(fund.votingPeriod))}
          </p>
        </BreakdownRow>
        <BreakdownRow label="Approval threshold">
          <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
            {formatBps(fund.approvalThresholdBps)}% of members
          </p>
        </BreakdownRow>
        <BreakdownRow label="Organizer">
          <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
            <Link
              href={`/account/${fund.owner}`}
              className="hover:text-primary-blue"
            >
              {formatAddress(fund.owner)}
            </Link>
          </p>
        </BreakdownRow>
      </div>
    </section>
  );
};

function PoolBalance({
  label,
  amount,
  className,
  unit = "BREAD",
}: {
  label: string;
  amount: bigint | undefined;
  className?: string;
  unit?: string;
}) {
  return (
    <Body className={`flex flex-col justify-start ${className}`}>
      <span className="text-surface-grey">{label}</span>
      <span className="inline-flex items-center justify-start">
        <Logo size={24} variant="square" className="mr-1" />
        <span className="font-bold mt-[0.2rem]">
          {amount !== undefined ? formatBalance(+formatEther(amount), 2) : "-"}{" "}
          {unit}
        </span>
      </span>
    </Body>
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

export default FundOverview;
