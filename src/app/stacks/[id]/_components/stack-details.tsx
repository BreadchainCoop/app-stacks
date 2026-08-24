import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState } from "@/lib/circle-state";
import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { ICircleStatus, MemberCircleInfo } from "@/interfaces/circle";
import {
  getUserCircleStatus,
  IFormattedUserCircleStatusResult,
} from "@/lib/get-user-circle-status";
import {
  formatSecondsHuman,
  getIntervalBySeconds,
  splitIntervalId,
} from "@/utils/deposit-interval";
import { formatAmount } from "@/utils/format-amount";
import { amountSizeStep } from "@/utils/amount-size";
import { cn } from "@/lib/utils";
import { FormattedDecimalNumber } from "@/components/bread-ui-kit/formatted-decimal-number";
import { Body, Heading3, useConnectedUser } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";
import { formatEther } from "viem";
import OverallStacked from "./overall-stacked";

const failedStatuses: ICircleStatus[] = [
  "decommissioned",
  "expired",
  "failed",
  "finished",
];

// Now that this page shows amounts in full, the hero steps down a size once the
// figure gets long, so "$1,250,000.00" doesn't run past its container.
const HERO_SIZES = {
  base: { integral: "text-[80px]", decimal: "text-[48px]" },
  sm: { integral: "text-[56px]", decimal: "text-[34px]" },
  xs: { integral: "text-[40px]", decimal: "text-[24px]" },
} as const;

const StackDetailsTotal = ({
  intervalLabel,
  depositPerRound,
  circleStatus,
  poolBalance,
  completedRounds,
  circleId,
  totalRounds,
  circleStartsTimestamp,
  depositInterval,
}: {
  intervalLabel: string;
  depositPerRound: string;
  circleStatus: IFormattedUserCircleStatusResult;
  poolBalance: string;
  completedRounds: bigint;
  circleId: string;
  totalRounds: number;
  circleStartsTimestamp: bigint;
  depositInterval: bigint;
}) => {
  let totalAmountStackedByMembers = "0.00";

  if (circleStatus.status !== "pending-start") {
    totalAmountStackedByMembers = String(
      +depositPerRound * Number(completedRounds) + Number(poolBalance)
    );
  }

  const heroSize = HERO_SIZES[amountSizeStep(+depositPerRound)];

  return (
    <div className="flex flex-col gap-6 mb-3 md:mb-0 md:flex-1 md:justify-end">
      <div className="flex items-center justify-start gap-x-4 flex-wrap">
        <FormattedDecimalNumber
          value={depositPerRound}
          unit="$"
          integralPartClassName={heroSize.integral}
          decimalPartClassName={cn(heroSize.decimal, "text-surface-grey-2")}
        />
        <div>
          <Body className="text-surface-grey-2">
            Total deposited per {intervalLabel}
          </Body>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 flex-row items-center justify-between">
        <Body className="shrink-0 text-surface-grey-2">
          Overall deposited by members
        </Body>
        <div className="shrink-0 flex items-center justify-start flex-wrap gap-2">
          <OverallStacked
            circleId={circleId}
            status={circleStatus}
            totalAmountStackedByMembers={totalAmountStackedByMembers}
            totalRounds={totalRounds}
            circleStartsTimestamp={circleStartsTimestamp}
            depositInterval={depositInterval}
          />
        </div>
      </div>
    </div>
  );
};

const StackDetailsBreakdownRow = ({
  label,
  children,
}: {
  children: ReactNode;
  label: string;
}) => {
  return (
    <div className="bg-paper-1 py-2 px-4 flex flex-col gap-2.5 mb-2 last:mb-0 md:flex-row md:justify-between">
      <Body className="text-surface-grey-2 capitalize">{label}</Body>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

const StackDetailsBreakdown = ({
  circle,
  intervalId,
  intervalLabel,
  depositInterval,
  roundsLeft,
  status,
}: {
  circle: MemberCircleInfo;
  intervalId: string;
  intervalLabel: string;
  depositInterval: string;
  roundsLeft: number | string;
  status: IFormattedUserCircleStatusResult;
}) => {
  let _roundsLeft = "-";

  const parsedInterval = splitIntervalId(intervalId);
  const hasNoTimeLeft = failedStatuses.includes(status.status);

  if (status.status !== "pending-start") {
    _roundsLeft = `${+roundsLeft * parsedInterval[0]}`;
  }

  return (
    <div className="md:flex-1">
      <StackDetailsBreakdownRow label={`${intervalLabel} deposit`}>
        <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
          ${formatAmount(+formatEther(circle.depositAmount), 2)}
        </p>
      </StackDetailsBreakdownRow>
      <StackDetailsBreakdownRow label="Members deposit every">
        <>
          <CalendarDotsIcon size={24} className="fill-blue-2" />
          <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
            {depositInterval.split(" ")[0]}
          </p>
          <p>{depositInterval.split(" ")[1]}</p>
        </>
      </StackDetailsBreakdownRow>
      <StackDetailsBreakdownRow label="Time left">
        <>
          <p className="text-h2 leading-6 tracking-[-2%] text-2xl">
            {/* {status.status === "finished" ? "0" : _roundsLeft} */}
            {hasNoTimeLeft ? "0" : _roundsLeft}
          </p>
          {status.status !== "pending-start" && !hasNoTimeLeft && (
            <p>{parsedInterval[1]}</p>
          )}
        </>
      </StackDetailsBreakdownRow>
    </div>
  );
};

const StackDetails = ({
  id,
  circle: _circle,
}: {
  id: string;
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >;
}) => {
  const blockTimestamp = useBlockTimestamp();
  const { circleState } = useCircleState(BigInt(id));
  const circle = _circle.circleInfo;
  const members = _circle.totalRounds;
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const { data: creationTimestamp } = useGetCircleCreated({ circleId: id });

  const depositIntervalSeconds = Number(circle.depositInterval);
  const matchedInterval = getIntervalBySeconds(depositIntervalSeconds);
  const intervalLabel =
    matchedInterval?.label ?? formatSecondsHuman(depositIntervalSeconds);

  const depositPerRound = circle.depositAmount * members;
  const circleStatus = getUserCircleStatus({
    circle: _circle,
    now: BigInt(Math.floor(blockTimestamp / 1000)),
    circleState: circleState ?? CircleState.Active,
  });
  const roundsLeft =
    circleStatus.status === "finished"
      ? 0
      : Math.max(0, Number(members - circle.currentIndex));

  return (
    <section className="bg-paper-0 flex flex-col gap-6 p-4">
      <header className="flex flex-col gap-4 border-b border-paper-2 pb-4 md:flex-row md:justify-between">
        <Heading3 className="text-2xl">Stacks details</Heading3>
        {address ? (
          <div className="flex items-center justify-between gap-4">
            <div>
              <Body className="text-xs">
                <span className="text-surface-grey inline-block mr-1">ID:</span>
                <span className="text-surface-ink">{id}</span>
              </Body>
            </div>
            <div className="flex items-center justify-center gap-2">
              <Body className="text-xs text-surface-grey">Created on:</Body>
              <div className="flex items-center justify-center">
                <CalendarDotsIcon size={16} className="fill-blue-2 mr-2" />
                {creationTimestamp ? (
                  <>
                    <Body className="text-surface-ink text-xs">
                      {new Intl.DateTimeFormat("en-GB").format(
                        creationTimestamp
                      )}
                    </Body>
                  </>
                ) : (
                  <Body className="text-surface-ink text-xs">-</Body>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </header>
      <div className="md:flex md:justify-between md:gap-3">
        <StackDetailsTotal
          intervalLabel={
            intervalLabel.endsWith("ly")
              ? intervalLabel.slice(0, -2)
              : intervalLabel
          }
          depositPerRound={formatEther(depositPerRound)}
          poolBalance={formatEther(_circle.totalPoolBalance)}
          completedRounds={_circle.completedRounds}
          circleStatus={circleStatus}
          circleId={id}
          totalRounds={+_circle.totalRounds.toString()}
          circleStartsTimestamp={_circle.circleInfo.effectiveCircleStartTime}
          depositInterval={_circle.circleInfo.depositInterval}
        />
        <StackDetailsBreakdown
          circle={circle}
          intervalId={matchedInterval?.id || ""}
          intervalLabel={intervalLabel}
          depositInterval={
            matchedInterval?.description || matchedInterval?.label || ""
          }
          roundsLeft={roundsLeft.toString()}
          status={circleStatus}
        />
      </div>
    </section>
  );
};

export default StackDetails;
