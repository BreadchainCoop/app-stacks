"use client";

import LocalButton from "@/components/button";
import { useIsMiniPay } from "@/components/providers/is-minipay";
import { useDepositToken } from "@/components/providers/active-chain";
import { formatDepositAmount } from "@/lib/deposit-token";
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
  const depositToken = useDepositToken();

  if (balance === undefined || balance >= amount) return null;

  const missing = formatBalance(
    +formatDepositAmount(amount - balance, depositToken.decimals),
    2
  );

  return (
    <div className="flex flex-col gap-2">
      <Body className="text-xs text-system-red">
        You need {missing} more {depositToken.symbol} for this.
      </Body>
      {isMiniPay && (
        <LocalButton
          as="a"
          href={MINIPAY_ADD_CASH_URL}
          variant="secondary"
          className="w-full font-bold"
        >
          Deposit {depositToken.symbol}
        </LocalButton>
      )}
    </div>
  );
};

export default BalanceHint;
