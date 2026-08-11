"use client";

import Loading from "@/app/loading";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Body, Caption, Heading2, formatBalance } from "@breadcoop/ui";
import { CoinsIcon, HandDepositIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Address, formatEther } from "viem";

const toBread = (value: bigint | undefined) =>
  Number(formatEther(value ?? BigInt(0)));

const cardClass =
  "border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26] md:p-8";

const AccountBalanceCard = ({
  address,
  basePath,
}: {
  address: Address;
  basePath: string;
}) => {
  const { setModal } = useModal();
  const isOwner = useIsOwnAddress(address);
  const { circles, financialSummary, isLoading } = useUserCirclesList(address);

  const scrollToStacks = () => {
    document
      .getElementById("your-stacks")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading)
    return (
      <div className={cardClass}>
        <Loading />
      </div>
    );

  const balance = toBread(financialSummary?.totalBalance);

  const pendingDeposits = circles.reduce(
    (sum, circle) =>
      circle.status === "payment_due"
        ? sum + toBread(circle.depositAmount)
        : sum,
    0
  );

  return (
    <div className={`flex flex-col gap-6 ${cardClass}`}>
      {/* Balance */}
      <div className="flex flex-col items-center gap-3 text-center">
        <Body className="flex items-center gap-2 text-surface-grey">
          <CoinsIcon size={20} weight="fill" className="text-primary-blue" />
          Balance
        </Body>
        <div className="flex flex-col items-center">
          <p className="text-4xl font-bold text-surface-ink md:text-5xl">
            ${formatBalance(balance, 2)}
          </p>
          <Caption className="text-surface-grey">
            {formatBalance(balance, 2)} BREAD
          </Caption>
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

      <div className="mx-auto h-px w-full max-w-[500px] bg-paper-2" />

      {/* Pending actions */}
      <div className="flex flex-col gap-4">
        <Heading2 className="text-xl">Pending actions</Heading2>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Body className="text-surface-grey">Pending deposits</Body>
            <p className="text-2xl font-bold text-[#d14a0f]">
              ${formatBalance(pendingDeposits, 2)}
            </p>
          </div>
          {isOwner &&
            (pendingDeposits > 0 ? (
              <LocalButton
                as={Link}
                href={`${basePath}?tab=due`}
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
            ))}
        </div>
      </div>
    </div>
  );
};

export default AccountBalanceCard;
