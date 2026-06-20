"use client";

import BackPage from "@/components/back-page";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { CopyStackLink } from "./copy-link";
import StackReminder from "./reminder";
import { formatEther } from "viem";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { ICircleStatus } from "@/interfaces/circle";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState } from "@/lib/circle-state";

type CircleData = Exclude<
  ReturnType<typeof useUserCircleData>["circleData"],
  undefined
>;

const HIDDEN_STATUSES: ICircleStatus[] = [
  "decommissioned",
  "pending-start",
  "finished",
  "expired",
  "failed",
];

const BackMeta = ({
  className,
  isLoadingCircleData,
  circle,
}: {
  className?: string;
  isLoadingCircleData: boolean;
  circle?: CircleData;
}) => {
  const now = useBlockTimestamp();
  const nowSeconds = BigInt(Math.floor(now / 1000));
  const { circleState } = useCircleState(circle?.circleId);

  const depositAmount = `${formatEther(
    circle?.circleInfo.depositAmount ?? BigInt(0)
  )} BREAD`;

  const circleStatus: ICircleStatus = circle
    ? getUserCircleStatus({
        circle,
        now: nowSeconds,
        circleState: circleState ?? CircleState.Active,
      }).status
    : "expired";

  const startTime = new Date(
    Number(
      (circle?.circleInfo.effectiveCircleStartTime || BigInt(0)).toString()
    ) * 1000
  );

  return (
    <div
      className={`flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:flex-wrap ${className}`}
    >
      <BackPage label="Return to Dashboard" href="/" className="m-0!" />
      <div className="flex items-center justify-start flex-wrap gap-4 pt-1.5 pb-1.5">
        <CopyStackLink />
        {!isLoadingCircleData &&
          circle &&
          circle.isMember &&
          !(HIDDEN_STATUSES as readonly string[]).includes(circleStatus) && (
            <StackReminder
              id={circle.circleId.toString()}
              depositAmount={depositAmount}
              startTime={startTime}
              circle={circle}
            />
          )}
      </div>
    </div>
  );
};

export default BackMeta;
