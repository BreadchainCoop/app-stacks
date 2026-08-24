"use client";

import CopyButton from "@/components/copy-button";
import { ModalContainer } from "../components";
import { NewUserOnboardingModalState, useModal } from "../context";
import {
  Body,
  Heading3,
  Logo,
  useBreadBalance,
  useConnectedUser,
} from "@breadcoop/ui";
import {
  ArrowRightIcon,
  CoinsIcon,
  CopyIcon,
  HandCoinsIcon,
  QuestionIcon,
  WalletIcon,
  XIcon,
} from "@phosphor-icons/react";
import { Address } from "viem";
import { formatAddress } from "@/utils/address";
import { formatAmount } from "@/utils/format-amount";
import Alert from "@/components/alert";
import Link from "next/link";
import LocalButton from "@/components/button";
import { usePathname } from "next/navigation";

function BreadBalance({ address }: { address: Address }) {
  const { BREAD } = useBreadBalance({ address });

  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <span className="font-breadDisplay text-[3rem] font-black leading-9 text-surface-ink">
          {formatAmount(parseFloat(BREAD))}
        </span>
        <span className="bg-paper-main p-1">
          <Logo size={24} variant="square" text="BREAD" />
        </span>
      </div>
      <Body className="text-xs text-surface-grey">
        ${formatAmount(parseFloat(BREAD))} USD
      </Body>
    </>
  );
}

const NewUserOnboarding = ({
  modalState,
}: {
  modalState: NewUserOnboardingModalState;
}) => {
  const pathname = usePathname();
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const fundingStatus = modalState.fundingStatus;

  const handleSkip = () => {
    setModal(null);
  };

  const handleFund = () => {
    if (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") {
      setModal({
        type: "FUND_WALLET",
        address: user.address,
        showSkipProcess: true,
        onFunded() {
          setModal({ type: "NEW_USER_ONBOARDING", fundingStatus: "success" });
        },
      });
    }
  };

  return (
    <ModalContainer className="max-w-155! items-stretch justify-start gap-6 border-paper-1 bg-paper-0 p-6">
      <div className="flex flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <button
            type="button"
            onClick={handleSkip}
            className="self-end text-body-bold text-primary-blue"
          >
            {fundingStatus === "success" ? <XIcon /> : "Skip this process"}
          </button>
          {(() => {
            const Icon =
              fundingStatus === "success" ? HandCoinsIcon : WalletIcon;

            return <Icon size={48} className="text-primary-blue" />;
          })()}
          <Heading3 className="text-[1.5rem] leading-6 text-surface-ink">
            {fundingStatus === "success"
              ? "You are ready to use Stacks!"
              : "Fund your wallet to use Stacks"}
          </Heading3>
        </header>

        <section className="flex flex-col items-center gap-4 text-center">
          <Body bold className="text-surface-grey-2">
            {fundingStatus === "success"
              ? "With funds in your wallet you can join a Stack or create one."
              : "Send xDAI to your wallet and automatically get BREAD"}
          </Body>
          <Body className="max-w-140 text-sm leading-normal text-surface-grey">
            {fundingStatus === "success"
              ? "You can always visit your wallet to check your balance or withdrawal your money by clicking on the menu bar."
              : "You can send xDAI from an external wallet or the wallet you connected when you signed up and we will automatically get you BREAD."}
          </Body>

          <div className="flex w-full max-w-121 flex-col gap-4 bg-paper-1 p-4">
            <div className="flex items-center justify-center gap-2">
              <Body bold>Your current balance</Body>
              <QuestionIcon size={16} className="text-surface-grey" />
            </div>

            <div className="flex flex-col items-center gap-1 py-1.5">
              {user.status === "CONNECTED" ? (
                <BreadBalance address={user.address} />
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <span className="font-breadDisplay text-[3rem] font-black leading-9 text-surface-ink">
                      0
                    </span>
                    <span className="bg-paper-main p-1">
                      <Logo size={24} variant="square" text="BREAD" />
                    </span>
                  </div>
                  <Body className="text-xs text-surface-grey">$0.00 USD</Body>
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 text-left">
              <Body className="text-surface-grey">Your wallet address:</Body>
              <div className="flex items-center gap-1 text-surface-grey">
                <Body>
                  {user.status === "CONNECTED"
                    ? formatAddress(user.address)
                    : "Loading..."}
                </Body>
                {user.status === "CONNECTED" && (
                  <CopyButton
                    varaint="icon"
                    textToCopy={user.address}
                    className="text-blue-2"
                    aria-label="Copy wallet address"
                  >
                    <CopyIcon size={24} />
                  </CopyButton>
                )}
              </div>
            </div>
            {fundingStatus !== "success" && (
              <Alert
                variant="warning"
                title="IMPORTANT: Always get xDAI"
                description="The token you need to send to your wallet is xDAI from Gnosis chain."
                closeAble={false}
                descClassName="text-left"
              />
            )}
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
          <LocalButton
            variant="secondary"
            // colorOverrides={{
            //   bg: "#B9D5FF",
            //   text: "--color-primary-blue",
            //   hoverBg: "#A8C3EA",
            //   hoverText: "--color-primary-blue",
            // }}
            onClick={handleSkip}
            className="font-bold"
            // width="full"
            rightIcon={
              fundingStatus === "success" ? <WalletIcon size={24} /> : undefined
            }
          >
            {fundingStatus === "success" ? <>Visit Wallet</> : "Skip this"}
          </LocalButton>
          {fundingStatus === "success" ? (
            <LocalButton
              as={Link}
              href={pathname}
              className="lifted-button-container w-full md:w-auto"
              onClick={() => setModal(null)}
              rightIcon={<ArrowRightIcon size={24} />}
            >
              View my Stack
            </LocalButton>
          ) : (
            <LocalButton
              variant="positive"
              rightIcon={<CoinsIcon size={24} />}
              onClick={handleFund}
              disabled={fundingStatus === "loading"}
              className="font-bold sm:min-w-60"
            >
              {fundingStatus === "loading"
                ? "Funding..."
                : "Fund Stacks wallet"}
            </LocalButton>
          )}
        </div>
      </div>
    </ModalContainer>
  );
};

export default NewUserOnboarding;
