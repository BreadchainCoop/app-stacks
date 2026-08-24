"use client";

import Loading from "@/app/loading";
import { FormattedDecimalNumber } from "@/components/bread-ui-kit/formatted-decimal-number";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { Body, Caption, formatBalance, useBreadBalance } from "@breadcoop/ui";
import { CoinsIcon } from "@phosphor-icons/react";
import { Address } from "viem";

const AccountBalanceSummary = ({ address }: { address: Address }) => {
  const { setModal } = useModal();
  const isOwner = useIsOwnAddress(address);
  const balance = useBreadBalance({ address });

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Body className="flex items-center gap-2 text-surface-grey">
        <CoinsIcon size={20} weight="fill" className="text-primary-blue" />
        Balance
      </Body>
      <div className="flex flex-col items-center">
        {balance.BREAD ? (
          <>
            <FormattedDecimalNumber
              value={balance.BREAD}
              unit="$"
              compact
              integralPartClassName="text-4xl font-bold text-surface-ink md:text-5xl"
              decimalPartClassName="text-4xl font-bold text-surface-ink md:text-5xl"
            />
            <Caption className="text-surface-grey">
              {formatBalance(+balance.BREAD, 2)} BREAD
            </Caption>
          </>
        ) : (
          <Loading />
        )}
      </div>
      {isOwner && (
        <div className="flex gap-2">
          <LocalButton
            type="button"
            size="sm"
            variant="light"
            onClick={() => setModal({ type: "FUND_WALLET", address })}
            className="border-primary-blue text-sm font-bold text-primary-blue"
          >
            Deposit
          </LocalButton>
          <LocalButton
            type="button"
            size="sm"
            variant="light"
            onClick={() => setModal({ type: "WITHDRAW_BREAD" })}
            className="text-sm font-bold"
          >
            Withdraw
          </LocalButton>
        </div>
      )}
    </div>
  );
};

export default AccountBalanceSummary;
