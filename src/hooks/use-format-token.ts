import { useDepositToken } from "@/components/providers/active-chain";
import { formatDepositAmount } from "@/lib/deposit-token";
import { formatBalance } from "@breadcoop/ui";

/** Formats a raw amount of the active chain's deposit token, e.g. "1.50 USDT". */
export const useFormatToken = () => {
  const { decimals, symbol } = useDepositToken();

  return (amount: bigint) =>
    `${formatBalance(+formatDepositAmount(amount, decimals), 2)} ${symbol}`;
};
