"use client";

import Loading from "@/app/loading";
import { FormattedDecimalNumber } from "@/components/bread-ui-kit/formatted-decimal-number";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { Body, Caption, formatBalance } from "@breadcoop/ui";
import { CoinsIcon } from "@phosphor-icons/react";
import { Address, erc20Abi } from "viem";
import { useReadContract } from "wagmi";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import { getDefaultChainId } from "@/utils/chain";
import { useIsMiniPay } from "@/components/providers/is-minipay";
import { MINIPAY_ADD_CASH_URL } from "@/utils/minipay";

const AccountBalanceSummary = ({ address }: { address: Address }) => {
  const { setModal } = useModal();
  const isMiniPay = useIsMiniPay();
  const isOwner = useIsOwnAddress(address);
  // Read directly instead of @breadcoop/ui's useBreadBalance, which hardcodes
  // 18 decimals and misreports 6-decimal deposit tokens (USDT/USDC on Celo).
  const { data, isLoading } = useReadContract({
    address: DEPOSIT_TOKEN.address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address],
    chainId: getDefaultChainId(),
    query: { enabled: Boolean(address) },
  });

  // A zero balance is a real answer, so gate the spinner on the read itself
  // rather than on the value being truthy.
  const balance = formatDepositAmount(data ?? BigInt(0));

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <Body className="flex items-center gap-2 text-surface-grey">
        <CoinsIcon size={20} weight="fill" className="text-primary-blue" />
        Balance
      </Body>
      <div className="flex flex-col items-center">
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <FormattedDecimalNumber
              value={balance}
              unit="$"
              compact
              integralPartClassName="text-4xl font-bold text-surface-ink md:text-5xl"
              decimalPartClassName="text-4xl font-bold text-surface-ink md:text-5xl"
            />
            <Caption className="text-surface-grey">
              {formatBalance(+balance, 2)} {DEPOSIT_TOKEN.symbol}
            </Caption>
          </>
        )}
      </div>
      {isOwner && (
        <div className="flex gap-2">
          <LocalButton
            type="button"
            size="sm"
            variant="light"
            onClick={() => {
              // MiniPay users top up through MiniPay's own rails; the Privy
              // funding modal is not available in that stack.
              if (isMiniPay) {
                window.location.href = MINIPAY_ADD_CASH_URL;
                return;
              }
              setModal({ type: "FUND_WALLET", address });
            }}
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
