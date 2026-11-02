"use client";

import { useChainPath } from "@/components/providers/active-chain";
import { CalendarIcon } from "@/components/icons/calendar";
import { CoinsIcon } from "@/components/icons/coin";
import { useAddressConditionalGrants } from "@/hooks/use-conditional-grant";
import { useFormatToken } from "@/hooks/use-format-token";
import {
  GRANT_STATE_CHIP_CLASSES,
  GRANT_STATE_LABELS,
  paidBackPercent,
} from "@/lib/conditional-grant-state";
import { stackTypeDetailPath } from "@/lib/stack-types";
import { formatShortDate } from "@/utils/time";
import { Address } from "viem";
import StackCard from "./stack-card";
import StackListSection from "./stack-list-section";

/** The conditional grants an address gave or received, linking to each one's page. */
const ConditionalGrantList = ({
  address,
}: {
  address: Address | undefined;
}) => {
  const formatToken = useFormatToken();
  const chainHref = useChainPath();
  const { grants, isLoading } = useAddressConditionalGrants(address);

  return (
    <StackListSection
      title="Conditional grants"
      isLoading={isLoading}
      isEmpty={grants.length === 0}
      emptyMessage="No conditional grants yet."
    >
      {grants.map(({ id, terms, status, state }) => {
        const isGrantor =
          !!address && status.grantor.toLowerCase() === address.toLowerCase();
        const accepted = status.acceptedAt > BigInt(0);

        return (
          <StackCard
            key={id.toString()}
            href={chainHref(stackTypeDetailPath("conditionalGrant", id))}
            name={isGrantor ? `Grant ${id} (given)` : `Grant ${id} (received)`}
            id={id.toString()}
            progress={paidBackPercent(
              status.paidBack,
              terms.advance + terms.fee
            )}
            progressLabel="Paid back"
            chip={{
              label: GRANT_STATE_LABELS[state],
              className: GRANT_STATE_CHIP_CLASSES[state],
            }}
            stats={[
              {
                label: "Advance / grant",
                icon: <CoinsIcon />,
                value: `${formatToken(terms.advance)} / ${formatToken(terms.grant)}`,
              },
              {
                label: accepted ? "Pay back by" : "Offer open until",
                icon: <CalendarIcon />,
                value:
                  accepted && status.payBackBy === BigInt(0)
                    ? "No deadline"
                    : formatShortDate(
                        Number(accepted ? status.payBackBy : terms.acceptBy) *
                          1000
                      ),
              },
            ]}
          />
        );
      })}
    </StackListSection>
  );
};

export default ConditionalGrantList;
