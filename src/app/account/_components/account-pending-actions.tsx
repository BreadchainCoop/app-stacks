"use client";

import Loading from "@/app/loading";
import LocalButton from "@/components/button";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Body, Heading2, formatBalance } from "@breadcoop/ui";
import { HandDepositIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { Address, formatEther } from "viem";

const toBread = (value: bigint | undefined) =>
  Number(formatEther(value ?? BigInt(0)));

const scrollToStacks = () => {
  document
    .getElementById("your-stacks")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const AccountPendingActions = ({
  address,
  basePath,
}: {
  address: Address;
  basePath: string;
}) => {
  const { circles, isLoading, error } = useUserCirclesList(address);
  const isOwner = useIsOwnAddress(address);

  const pendingDeposits = circles.reduce(
    (sum, circle) =>
      circle.status === "payment_due"
        ? sum + toBread(circle.depositAmount)
        : sum,
    0
  );

  return (
    <div className="flex flex-col gap-4">
      <Heading2 className="text-xl">Pending actions</Heading2>
      {isLoading ? (
        <Loading />
      ) : error ? (
        <Body className="text-red-1">Error! Try again</Body>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Body className="text-surface-grey">Pending deposits</Body>
            <p className="text-2xl font-bold text-orange-1">
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
      )}
    </div>
  );
};

export default AccountPendingActions;
