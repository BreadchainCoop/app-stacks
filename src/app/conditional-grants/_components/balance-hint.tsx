"use client";

import LocalButton from "@/components/button";
import { useIsMiniPay } from "@/components/providers/is-minipay";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { MINIPAY_ADD_CASH_URL } from "@/utils/minipay";
import { Body, formatBalance } from "@breadcoop/ui";

/**
 * Shown under a token-pulling action when the wallet can't cover `amount`.
 * In MiniPay it links to Add Cash, matching the deposit flow.
 */
const BalanceHint = ({
  balance,
  amount,
}: {
  balance: bigint | undefined;
  amount: bigint;
}) => {
  const isMiniPay = useIsMiniPay();

  if (balance === undefined || balance >= amount) return null;

  const missing = formatBalance(+formatDepositAmount(amount - balance), 2);

  return (
    <div className="flex flex-col gap-2">
      <Body className="text-xs text-system-red">
        You need {missing} more {DEPOSIT_TOKEN.symbol} for this.
      </Body>
      {isMiniPay && (
        <LocalButton
          as="a"
          href={MINIPAY_ADD_CASH_URL}
          variant="secondary"
          className="w-full font-bold"
        >
          Deposit {DEPOSIT_TOKEN.symbol}
        </LocalButton>
      )}
    </div>
  );
};

export default BalanceHint;
