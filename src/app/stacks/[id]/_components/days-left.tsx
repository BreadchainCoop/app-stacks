"use client";

import Countdown from "@/components/countdown";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { Body } from "@breadcoop/ui";
import { CalendarStarIcon } from "@phosphor-icons/react";

const DaysLeft = ({
  depositWindowEnd,
  effectiveCircleStartTime,
  currentIndex,
  depositInterval,
  isActive,
}: {
  depositWindowEnd: bigint | undefined;
  effectiveCircleStartTime: bigint | undefined;
  currentIndex: bigint | undefined;
  depositInterval: bigint | undefined;
  isActive?: boolean;
}) => {
  const blockTimestamp = useBlockTimestamp();
  let daysLeft = "-";
  let progressPercent = 0;

  if (
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
      const _daysLeft = Math.floor(timeLeft / (60 * 60 * 24));
      daysLeft = `${_daysLeft} ${_daysLeft === 1 ? "day" : "days"}`;

      const timePassed = now - currentRoundStart;
      progressPercent = Math.min(100, (timePassed / totalDuration) * 100);
    } else {
      daysLeft = "0 days";
      progressPercent = 100;
    }
  }

  return (
    <div>
      <div>
        <div className="flex items-center justify-start gap-0.5">
          <CalendarStarIcon size={24} className="fill-blue-2" />
          <Body>Days left until current round ends</Body>
        </div>
        <p className="text-h2 text-2xl leading-6 mt-2">{daysLeft}</p>
      </div>
      <div className="w-full h-4 bg-paper-2 mt-4 mb-2 p-0.75">
        <div
          className="h-full bg-primary-blue"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {Boolean(Number(effectiveCircleStartTime)) && isActive && (
        <Countdown
          targetSeconds={Number(depositWindowEnd)}
          // key={depositWindowEnd}
        />
      )}
    </div>
  );
};

export default DaysLeft;
