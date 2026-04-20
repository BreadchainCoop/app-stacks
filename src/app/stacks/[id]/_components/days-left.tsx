"use client";

import Countdown from "@/components/countdown";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { ICircleStatus } from "@/interfaces/circle";
import { Body } from "@breadcoop/ui";
import {
  CalendarCheckIcon,
  CalendarDotIcon,
  CalendarStarIcon,
} from "@phosphor-icons/react";

const DaysLeft = ({
  depositWindowEnd,
  effectiveCircleStartTime,
  currentIndex,
  depositInterval,
  isActive,
  circleEnd,
  status,
}: {
  depositWindowEnd: bigint | undefined;
  effectiveCircleStartTime: bigint | undefined;
  currentIndex: bigint | undefined;
  depositInterval: bigint | undefined;
  isActive?: boolean;
  circleEnd?: bigint;
  status?: ICircleStatus;
}) => {
  const blockTimestamp = useBlockTimestamp();
  let daysLeft = "-";
  let progressPercent = 0;
  const isCompleted = status === "finished";
  const isPendingStart = status === "pending-start";

  if (isCompleted) {
    progressPercent = 100;
  } else if (
    depositWindowEnd &&
    isActive &&
    effectiveCircleStartTime &&
    depositInterval &&
    currentIndex !== undefined
  ) {
    const now = Math.floor(blockTimestamp / 1000);
    const currentRoundEnd = Number(depositWindowEnd);

    const currentRoundStart =
      Number(effectiveCircleStartTime) +
      Number(depositInterval) * Number(currentIndex);

    const totalDuration = Number(depositInterval);

    const timeLeft = currentRoundEnd - now;

    if (timeLeft > 0) {
      const _daysLeft = Math.ceil(timeLeft / (60 * 60 * 24));
      daysLeft = `${_daysLeft} ${_daysLeft === 1 ? "day" : "days"}`;

      const timePassed = now - currentRoundStart;
      progressPercent = Math.min(100, (timePassed / totalDuration) * 100);
    } else {
      daysLeft = "0 days";
      progressPercent = 100;
    }
  }

  const completedDate =
    circleEnd && Number(circleEnd) > 0
      ? new Intl.DateTimeFormat("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }).format(new Date(Number(circleEnd) * 1000))
      : null;

  return (
    <div>
      <div>
        <div className="flex items-center justify-start gap-0.5">
          {isCompleted ? (
            <CalendarCheckIcon size={24} className="fill-system-green" />
          ) : isPendingStart ? (
            <CalendarDotIcon size={24} className="fill-surface-grey" />
          ) : (
            <CalendarStarIcon size={24} className="fill-blue-2" />
          )}
          <Body className={isPendingStart ? "text-surface-grey" : undefined}>
            {isCompleted
              ? "Circle completed"
              : isPendingStart
                ? "Waiting for circle to start"
                : "Days left until current round ends"}
          </Body>
        </div>
        {!isCompleted && !isPendingStart && (
          <p className="text-h2 text-2xl leading-6 mt-2">{daysLeft}</p>
        )}
      </div>
      <div className="w-full h-4 bg-paper-2 mt-4 mb-2 p-0.75">
        <div
          className={`h-full ${
            isCompleted
              ? "bg-system-green"
              : isPendingStart
                ? "bg-surface-grey"
                : "bg-primary-blue"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {isCompleted ? (
        <Body className="text-system-green">
          {completedDate ? `Completed on ${completedDate}` : "Circle completed"}
        </Body>
      ) : isPendingStart ? null : (
        isActive && (
          <Countdown
            targetSeconds={Number(depositWindowEnd)}
            // key={depositWindowEnd}
          />
        )
      )}
    </div>
  );
};

export default DaysLeft;
