"use client";

import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import { ICircleStatus } from "@/interfaces/circle";
import { IFormattedUserCircleStatusResult } from "@/lib/get-user-circle-status";
import { formatAmount } from "@/utils/format-amount";
import { Body } from "@breadcoop/ui";
import { formatEther } from "viem";

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
    return <Body>${formatAmount(+totalAmountStackedByMembers, 2)}</Body>;
  }

  if (fundsDeposited.data) {
    return (
      <Body>
        ${formatAmount(+formatEther(fundsDeposited.data.totalDeposit), 2)}
      </Body>
    );
  }

  if (fundsDeposited.isLoading) {
    return <>Loading...</>;
  }

  return <>-</>;
};

export default OverallStacked;
