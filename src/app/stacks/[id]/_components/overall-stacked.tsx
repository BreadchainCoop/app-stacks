"use client";

import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import { ICircleStatus } from "@/interfaces/circle";
import { IFormattedUserCircleStatusResult } from "@/lib/get-user-circle-status";
import { formatBalance, Logo } from "@breadcoop/ui";
import { formatDepositAmount } from "@/lib/deposit-token";

const failedStatuses: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

const OverallStacked = ({
  circleId,
  status,
  totalAmountStackedByMembers,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  circleId: string;
  status: IFormattedUserCircleStatusResult;
  totalAmountStackedByMembers: string;
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) => {
  const isFailedStack = failedStatuses.includes(status.status);

  const fundsDeposited = useFundsDeposited({
    circleId: circleId,
    enabled: isFailedStack,
    totalRounds,
    circleStartsTimestamp,
    depositInterval,
  });

  if (!isFailedStack) {
    return (
      <Logo
        variant="square"
        text={formatBalance(+totalAmountStackedByMembers, 2)}
        size={24}
      />
    );
  }

  if (fundsDeposited.data) {
    return (
      <Logo
        variant="square"
        text={formatBalance(
          +formatDepositAmount(fundsDeposited.data.totalDeposit),
          2
        )}
        size={24}
      />
    );
  }

  if (fundsDeposited.isLoading) {
    return <>Loading...</>;
  }

  return <>-</>;
};

export default OverallStacked;
