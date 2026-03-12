"use client";

import Countdown from "@/components/countdown";
import { Body } from "@breadcoop/ui";
import { CalendarStarIcon } from "@phosphor-icons/react";

const formatRemainingTime = (secondsLeft: number) => {
  if (secondsLeft <= 0) return "0 minutes";

  const minutes = Math.ceil(secondsLeft / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
  }

  const hours = Math.ceil(secondsLeft / (60 * 60));
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  const days = Math.ceil(secondsLeft / (60 * 60 * 24));
  return `${days} ${days === 1 ? "day" : "days"}`;
};

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
  let timeLeftLabel = "-";
  let progressPercent = 0;

  if (
    depositWindowEnd &&
    isActive &&
    effectiveCircleStartTime &&
    depositInterval &&
    currentIndex !== undefined
  ) {
    const now = Math.floor(Date.now() / 1000);
    const currentRoundEnd = Number(depositWindowEnd);

    const currentRoundStart =
      Number(effectiveCircleStartTime) +
      Number(depositInterval) * Number(currentIndex);

    const totalDuration = Number(depositInterval);

    const timeLeft = currentRoundEnd - now;

    if (timeLeft > 0) {
      timeLeftLabel = formatRemainingTime(timeLeft);

      const timePassed = now - currentRoundStart;
      progressPercent = Math.min(100, (timePassed / totalDuration) * 100);
    } else {
      timeLeftLabel = "0 minutes";
      progressPercent = 100;
    }
  }

  return (
    <div>
      <div>
        <div className="flex items-center justify-start gap-0.5">
          <CalendarStarIcon size={24} className="fill-blue-2" />
          <Body>Time left until current round ends</Body>
        </div>
        <p className="text-h2 text-2xl leading-6 mt-2">{timeLeftLabel}</p>
      </div>
      <div className="w-full h-4 bg-paper-2 mt-4 mb-2 p-0.75">
        <div
          className="h-full bg-primary-blue"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      {Boolean(Number(effectiveCircleStartTime)) && (
        <Countdown
          targetSeconds={Number(depositWindowEnd)}
          // key={depositWindowEnd}
        />
      )}
    </div>
  );
};

export default DaysLeft;
