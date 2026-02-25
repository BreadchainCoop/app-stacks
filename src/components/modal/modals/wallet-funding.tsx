"use client";

import CopyButton from "@/components/copy-button";
import { ModalContainer } from "../components";
import { WalletFundingModalState, useModal } from "../context";
import { Body, Heading3, LiftedButton, Logo } from "@breadcoop/ui";
import {
  CoinsIcon,
  CopyIcon,
  QuestionIcon,
  WalletIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

function shortAddress(address?: string) {
  if (!address) return "Preparing wallet...";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatBreadBalance(balance?: string) {
  const value = Number(balance ?? 0);
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
  });
}

const WalletFundingModal = ({
  modalState,
}: {
  modalState: WalletFundingModalState;
}) => {
  const { setModal } = useModal();
  const [isFunding, setIsFunding] = useState(false);
  const balance = formatBreadBalance(modalState.breadBalance);
  const walletLabel = shortAddress(modalState.walletAddress);

  const handleSkip = () => {
    modalState.onSkip?.();
    setModal(null);
  };

  const runFundingFlow = async () => {
    setModal({
      type: "WALLET_FUNDING_STATUS",
      status: "loading",
    });
    const didFund = await modalState.onFund();
    setModal({
      type: "WALLET_FUNDING_STATUS",
      status: didFund ? "success" : "error",
      onRetry: runFundingFlow,
    });
  };

  const handleFund = async () => {
    setIsFunding(true);
    await runFundingFlow();
  };

  return (
    <ModalContainer className="max-w-[38.75rem] items-stretch justify-start gap-6 border-paper-1 bg-paper-0 p-6">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="self-end text-body-bold text-primary-blue"
          >
            Skip this process
          </button>
          <WalletIcon size={48} className="text-primary-blue" />
          <Heading3 className="text-[1.5rem] leading-6 text-surface-ink">
            Fund your wallet to use Stacks
          </Heading3>
        </header>

        <section className="flex flex-col items-center gap-4 text-center">
          <Body bold className="text-surface-grey-2">
            Send xDAI to your wallet and automatically get BREAD
          </Body>
          <Body className="max-w-[35rem] text-sm leading-[1.5] text-surface-grey">
            You can send xDAI from an external wallet or the wallet you
            connected when you signed up and we will automatically get you
            BREAD.
          </Body>

          <div className="flex w-full max-w-[30.25rem] flex-col gap-4 bg-paper-1 p-4">
            <div className="flex items-center justify-center gap-2">
              <Body bold>Your current balance</Body>
              <QuestionIcon size={16} className="text-surface-grey" />
            </div>

            <div className="flex flex-col items-center gap-1 py-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="font-breadDisplay text-[3rem] font-[900] leading-9 text-surface-ink">
                  {balance}
                </span>
                <span className="bg-paper-main p-1">
                  <Logo size={24} variant="square" text="BREAD" />
                </span>
              </div>
              <Body className="text-xs text-surface-grey">$0.00 USD</Body>
            </div>

            <div className="flex items-center justify-between gap-3 text-left">
              <Body className="text-surface-grey">Your wallet address:</Body>
              <div className="flex items-center gap-1 text-surface-grey">
                <Body>{walletLabel}</Body>
                {modalState.walletAddress && (
                  <CopyButton
                    varaint="icon"
                    textToCopy={modalState.walletAddress}
                    className="text-blue-2"
                    aria-label="Copy wallet address"
                  >
                    <CopyIcon size={24} />
                  </CopyButton>
                )}
              </div>
            </div>

            <div className="border-l-4 border-system-warning bg-[#FFEDD0] px-6 py-3 text-left">
              <div className="mb-2 flex items-center gap-1.5 text-system-warning">
                <WarningIcon size={16} />
                <Body bold>IMPORTANT: Always get xDAI</Body>
              </div>
              <Body>
                The token you need to send to your wallet is xDAI from Gnosis
                chain.
              </Body>
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <LiftedButton
            preset="secondary"
            colorOverrides={{
              bg: "#B9D5FF",
              text: "--color-primary-blue",
              hoverBg: "#A8C3EA",
              hoverText: "--color-primary-blue",
            }}
            onClick={handleSkip}
            className="font-bold"
            width="full"
          >
            Skip this
          </LiftedButton>
          <LiftedButton
            preset="positive"
            rightIcon={<CoinsIcon size={24} />}
            onClick={handleFund}
            disabled={isFunding}
            className="font-bold sm:min-w-60"
            width="full"
          >
            {isFunding ? "Opening..." : "Fund Stacks wallet"}
          </LiftedButton>
        </div>
      </div>
    </ModalContainer>
  );
};

export default WalletFundingModal;
