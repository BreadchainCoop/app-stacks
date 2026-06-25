"use client";

import Loading from "@/app/loading";
import { useModal } from "@/components/modal/context";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Body, formatBalance } from "@breadcoop/ui";
import {
  CoinsIcon,
  HandDepositIcon,
  HandWithdrawIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { Address, formatEther } from "viem";
import LocalButton from "@/components/button";

const toBread = (value: bigint | undefined) =>
  Number(formatEther(value ?? BigInt(0)));

const SmallButton = ({
  children,
  onClick,
  tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone: "primary" | "ink";
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`border bg-paper-main px-4 py-1.5 text-sm font-bold shadow-[2px_2px_0px_#595959] transition-opacity hover:opacity-90 ${
      tone === "primary"
        ? "border-primary-blue text-primary-blue"
        : "border-surface-ink text-surface-ink"
    }`}
  >
    {children}
  </button>
);

const Column = ({
  label,
  amount,
  cta,
}: {
  label: string;
  amount: number;
  cta: React.ReactNode;
}) => (
  <div className="flex flex-col gap-3">
    <Body className="text-surface-grey">{label}</Body>
    <p className="text-2xl font-bold text-surface-ink">
      ${formatBalance(amount, 2)}
    </p>
    {cta}
  </div>
);

const AccountOverviewCard = ({ address }: { address: Address }) => {
  const { setModal } = useModal();
  const { circles, financialSummary, isLoading } = useUserCirclesList(address);

  const scrollToStacks = () => {
    document
      .getElementById("your-stacks")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) return <Loading />;

  const totalHeld = toBread(financialSummary?.totalBalance);

  let claimTotal = 0;
  let depositTotal = 0;
  circles.forEach((circle) => {
    if (circle.canWithdraw && circle.withdrawAmount) {
      claimTotal += circle.withdrawAmount;
    }
    if (circle.status === "payment_due") {
      depositTotal += Number(formatEther(circle.depositAmount));
    }
  });

  return (
    <div className="grid grid-cols-1 gap-8 border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26] md:grid-cols-3 md:p-8">
      {/* Total funds held */}
      <div className="flex flex-col gap-3">
        <Body className="flex items-center gap-2 text-surface-grey">
          <CoinsIcon size={20} weight="fill" className="text-primary-blue" />
          Total funds held
        </Body>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-4xl font-bold text-surface-ink md:text-5xl">
            ${formatBalance(totalHeld, 2)}
          </p>
          <div className="flex gap-2">
            <SmallButton
              tone="primary"
              onClick={() => setModal({ type: "FUND_WALLET", address })}
            >
              Deposit
            </SmallButton>
            <SmallButton
              tone="ink"
              onClick={() => setModal({ type: "WITHDRAW_BREAD" })}
            >
              Withdraw
            </SmallButton>
          </div>
        </div>
      </div>

      {/* Funds to claim */}
      <Column
        label="Funds to claim"
        amount={claimTotal}
        cta={
          claimTotal > 0 ? (
            <LocalButton
              as={Link}
              href="/my-account?tab=claim"
              scroll={false}
              onClick={scrollToStacks}
              variant="positive"
              className="claim-btn font-bold"
              leftIcon={<HandWithdrawIcon />}
            >
              Claim
            </LocalButton>
          ) : (
            <LocalButton
              variant="positive"
              disabled
              className="font-bold opacity-50"
              leftIcon={<HandWithdrawIcon />}
            >
              Claim
            </LocalButton>
          )
        }
      />

      {/* Funds to deposit */}
      <Column
        label="Funds to deposit"
        amount={depositTotal}
        cta={
          depositTotal > 0 ? (
            <LocalButton
              as={Link}
              href="/my-account?tab=due"
              scroll={false}
              onClick={scrollToStacks}
              className="font-bold"
              leftIcon={<HandDepositIcon />}
            >
              Deposit funds
            </LocalButton>
          ) : (
            <LocalButton
              disabled
              className="font-bold opacity-50"
              leftIcon={<HandDepositIcon />}
            >
              Deposit funds
            </LocalButton>
          )
        }
      />
    </div>
  );
};

export default AccountOverviewCard;
