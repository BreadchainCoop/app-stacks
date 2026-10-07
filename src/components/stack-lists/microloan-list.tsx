"use client";

import { CalendarIcon } from "@/components/icons/calendar";
import { CoinsIcon } from "@/components/icons/coin";
import { useAddressMicroloans } from "@/hooks/use-microloan";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import {
  LOAN_STATE_CHIP_CLASSES,
  LOAN_STATE_LABELS,
  loanRepaidPercent,
} from "@/lib/microloan-state";
import { stackTypeDetailPath } from "@/lib/stack-types";
import { formatShortDate } from "@/utils/time";
import { formatBalance } from "@breadcoop/ui";
import { Address } from "viem";
import StackCard from "./stack-card";
import StackListSection from "./stack-list-section";

const formatToken = (amount: bigint) =>
  `${formatBalance(+formatDepositAmount(amount), 2)} ${DEPOSIT_TOKEN.symbol}`;

/** The loans an address lent or borrows, linking to each loan's page. */
const MicroloanList = ({ address }: { address: Address | undefined }) => {
  const { loans, isLoading } = useAddressMicroloans(address);

  return (
    <StackListSection
      title="Microloans"
      isLoading={isLoading}
      isEmpty={loans.length === 0}
      emptyMessage="No microloans yet."
    >
      {loans.map(({ id, terms, status, state }) => {
        const isLender =
          !!address && status.lender.toLowerCase() === address.toLowerCase();
        const accepted = status.acceptedAt > BigInt(0);

        return (
          <StackCard
            key={id.toString()}
            href={stackTypeDetailPath("microloan", id)}
            name={isLender ? `Loan ${id} (lent)` : `Loan ${id} (borrowed)`}
            id={id.toString()}
            progress={loanRepaidPercent(status.repaid, status.disbursed)}
            progressLabel="Repaid"
            chip={{
              label: LOAN_STATE_LABELS[state],
              className: LOAN_STATE_CHIP_CLASSES[state],
            }}
            stats={[
              {
                label: "Loan / grant",
                icon: <CoinsIcon />,
                value: `${formatToken(terms.principal)} / ${formatToken(terms.grant)}`,
              },
              {
                label: accepted ? "Repay by" : "Offer open until",
                icon: <CalendarIcon />,
                value: formatShortDate(
                  Number(accepted ? status.repayBy : terms.acceptBy) * 1000
                ),
              },
            ]}
          />
        );
      })}
    </StackListSection>
  );
};

export default MicroloanList;
