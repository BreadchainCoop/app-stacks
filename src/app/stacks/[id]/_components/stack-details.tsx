import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { MemberCircleInfo } from "@/interfaces/circle";
import {
  getUserCircleStatus,
  IFormattedUserCircleStatusResult,
} from "@/lib/get-user-circle-status";
import {
  Body,
  formatBalance,
  FormattedDecimalNumber,
  Heading3,
  Logo,
  useConnectedUser,
} from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";
import { formatEther, zeroAddress } from "viem";
import { formatIntervalFromSeconds } from "@/lib/deposit-intervals";

const StackDetailsTotal = ({
  intervalSummaryLabel,
  depositPerRound,
  totalRounds,
  circleStatus,
  poolBalance,
  completedRounds,
}: {
  intervalSummaryLabel: string;
  depositPerRound: string;
  totalRounds: bigint;
  circleStatus: IFormattedUserCircleStatusResult;
  poolBalance: string;
  completedRounds: bigint;
}) => {
  let totalAmountStackedByMembers = "0.00";
  if (circleStatus.status === "finished") {
    totalAmountStackedByMembers = String(
      +depositPerRound * Number(totalRounds)
    );
  } else if (circleStatus.status !== "pending-start") {
    totalAmountStackedByMembers = String(
      +depositPerRound * Number(completedRounds) + Number(poolBalance)
    );
  }
  return (
    <div className="flex flex-col gap-6 mb-3 md:mb-0 md:flex-1 md:justify-end">
      <div className="flex items-center justify-start gap-x-4 flex-wrap">
        <FormattedDecimalNumber
          value={depositPerRound}
          integralPartClassName="text-[80px]"
          decimalPartClassName="text-[48px] text-surface-grey-2"
        />
        <div>
          <Logo
            variant="square"
            text="BREAD"
            className="[&+span]:font-normal"
            size={24}
          />
          <Body className="text-surface-grey-2">
            Total stacked per {intervalSummaryLabel}
          </Body>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 flex-row items-center justify-between">
        <Body className="shrink-0 text-surface-grey-2">
          Overall stacked by members
        </Body>
        <div className="shrink-0 flex items-center justify-start flex-wrap gap-2">
          <Logo
            variant="square"
            // text={Number(totalAmountSaved || "0").toFixed(2)}
            text={formatBalance(+totalAmountStackedByMembers, 2)}
            size={24}
          />
          <Body className="mt-[0.2rem]">BREAD</Body>
        </div>
        {/* <TotalAmountStacked circleId={circleId} /> */}
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
      <Body className="text-surface-grey-2">{label}</Body>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
};

const StackDetailsBreakdown = ({
  circle,
  intervalSummaryLabel,
  roundsLeft,
  status,
}: {
  circle: MemberCircleInfo;
  intervalSummaryLabel: string;
  roundsLeft: number | string;
  status: IFormattedUserCircleStatusResult;
}) => {
  const _roundsLeft = status.status === "pending-start" ? "-" : roundsLeft;

  return (
    <div className="md:flex-1">
      <StackDetailsBreakdownRow label="Deposit per round">
        <>
          <Logo
            size={24}
            text={formatBalance(+formatEther(circle.depositAmount), 2)}
            variant="square"
          />
          <Body className="mt-[0.3rem]">BREAD</Body>
        </>
      </StackDetailsBreakdownRow>
      <StackDetailsBreakdownRow label="Members deposit every">
        <>
          <CalendarDotsIcon size={24} className="fill-blue-2" />
          <p className="text-h2 text-2xl leading-6 tracking-[-2%]">
            {intervalSummaryLabel}
          </p>
        </>
      </StackDetailsBreakdownRow>
      <StackDetailsBreakdownRow label="Time left">
        <>
          <p className="text-h2 leading-6 tracking-[-2%] text-2xl">
            {status.status === "finished" ? "0" : _roundsLeft}
          </p>
          {status.status !== "pending-start" && <p>Rounds</p>}
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
  const circle = _circle.circleInfo;
  const members = _circle.totalRounds;
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const { data: creationTimestamp } = useGetCircleCreated({ circleId: id });

  const { summaryLabel: intervalSummaryLabel } = formatIntervalFromSeconds(
    circle.depositInterval
  );

  const depositPerRound = circle.depositAmount * members;
  const circleStatus = getUserCircleStatus(_circle, zeroAddress);
  const roundsLeft =
    circleStatus.status === "finished" ? 0 : members - circle.currentIndex;

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
          intervalSummaryLabel={intervalSummaryLabel}
          depositPerRound={formatEther(depositPerRound)}
          poolBalance={formatEther(_circle.totalPoolBalance)}
          completedRounds={_circle.completedRounds}
          circleStatus={circleStatus}
          totalRounds={members}
        />
        <StackDetailsBreakdown
          circle={circle}
          intervalSummaryLabel={intervalSummaryLabel}
          roundsLeft={roundsLeft.toString()}
          status={circleStatus}
        />
      </div>
    </section>
  );
};

export default StackDetails;
