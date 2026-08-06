"use client";

import { Label } from "@/components/label";
import NumericInput from "@/components/numeric-input";
import { SubmitEventHandler, useState } from "react";
import { ModalContainer, ModalHeader } from "../../components";
import LocalButton from "@/components/button";
import { Body, formatBalance, Logo, useConnectedUser } from "@breadcoop/ui";
import { useModal } from "../../context";
import { formatEther, parseEther } from "viem";
import {
  FUNDING_TOKENS,
  FundingToken,
  useFundWithConnectedWallet,
} from "@/hooks/use-fund-with-connected-wallet";

export interface FundWithConnectedWalletModalAmountModalState {
  type: "FUND_WITH_CONNECTED_WALLET_MODAL_AMOUNT";
  wallet?: string;
}

interface FundWithConnectedWalletModalAmountProps {
  modalState: FundWithConnectedWalletModalAmountModalState;
}

const XDAI_GAS_BUFFER = parseEther("0.001");

const TokenIcon = ({ token }: { token: FundingToken }) =>
  token === "BREAD" ? (
    <Logo size={20} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/gnosis_icon.svg" alt="" className="w-5 h-5" />
  );

const FundWithConnectedWalletModalAmount = ({
  modalState,
}: FundWithConnectedWalletModalAmountProps) => {
  const { user } = useConnectedUser();
  const { setModal } = useModal();
  const [amount, setAmount] = useState("0");
  const [token, setToken] = useState<FundingToken>("xDAI");
  const [funding, setFunding] = useState(false);
  const { xDaiBalance, breadBalance, fundWallet } =
    useFundWithConnectedWallet();

  const tokenBalance = token === "BREAD" ? breadBalance : xDaiBalance;

  const formattedBalance = +formatEther(tokenBalance.data?.value || BigInt(0));

  const parsedAmount = (() => {
    try {
      return parseEther(amount);
    } catch {
      return null;
    }
  })();

  const maxAmount = (() => {
    if (!tokenBalance.data) return BigInt(0);
    if (token === "BREAD") return tokenBalance.data.value;

    const max = tokenBalance.data.value - XDAI_GAS_BUFFER;
    return max > BigInt(0) ? max : BigInt(0);
  })();

  const disabled =
    funding ||
    parsedAmount === null ||
    parsedAmount <= BigInt(0) ||
    (tokenBalance.data ? parsedAmount > tokenBalance.data.value : false);

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (disabled) return;

    setFunding(true);

    try {
      await fundWallet({ token, amount, wallet: modalState.wallet });
    } finally {
      setFunding(false);
    }
  };

  return (
    <ModalContainer>
      <div className="flex items-center justify-between">
        <ModalHeader title="Funding Amount" showCloseIcon={false} />
        <button
          type="button"
          onClick={() => {
            if (
              user.status === "CONNECTED" ||
              user.status === "UNSUPPORTED_CHAIN"
            ) {
              setModal({ type: "FUND_WALLET", address: user.address });
            }
          }}
          className="inline-block text-primary-blue font-semibold ml-auto cursor-pointer max-w-max"
        >
          Back
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <Label>Fund with</Label>
        <div className="flex gap-2 mb-4">
          {FUNDING_TOKENS.map((fundingToken) => (
            <button
              key={fundingToken}
              type="button"
              onClick={() => setToken(fundingToken)}
              className={`flex-1 flex items-center justify-center gap-2 border py-2 font-bold transition-colors cursor-pointer ${
                token === fundingToken
                  ? "border-primary-blue text-primary-blue bg-paper-1"
                  : "border-paper-2 text-surface-grey"
              }`}
            >
              <TokenIcon token={fundingToken} />
              {fundingToken}
            </button>
          ))}
        </div>
        <Label htmlFor="depositAmount">Amount</Label>
        <div className="relative">
          <NumericInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            name="depositAmount"
            id="depositAmount"
            className="w-full"
            allowDecimal
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-1 p-1 flex items-center justify-end gap-2.5">
            <Body bold className="bg-paper-main flex items-center gap-1.5">
              <TokenIcon token={token} />
              {token.toUpperCase()}
            </Body>
            <button
              onClick={() => {
                if (tokenBalance.isLoading) return;

                setAmount(formatEther(maxAmount));
              }}
              disabled={tokenBalance.isLoading}
              type="button"
              className={`inline-block font-bold max-w-max text-sm transition-colors ${tokenBalance.data ? "text-primary-blue cursor-pointer" : "text-surface-grey cursor-not-allowed"}`}
            >
              Max.
            </button>
          </div>
        </div>
        <Body className="max-w-max ml-auto mt-1 text-sm text-surface-grey">
          Balance:{" "}
          {tokenBalance.isLoading
            ? "Loading..."
            : formatBalance(formattedBalance)}
        </Body>
        <div className="lifted-button-container mt-6">
          <LocalButton
            disabled={disabled}
            className={disabled ? "bg-surface-grey text-paper-main" : ""}
            type="submit"
          >
            Fund
          </LocalButton>
        </div>
      </form>
    </ModalContainer>
  );
};

export default FundWithConnectedWalletModalAmount;
