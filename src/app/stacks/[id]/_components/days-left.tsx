```tsx
"use client";

import Countdown from "@/components/countdown";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { Body } from "@breadcoop/ui";
import { CalendarStarIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { invalidateCircleReads } from "@/utils/invalidate-circle-reads";

const formatDate = (seconds: number) =>
  new Date(seconds * 1000).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

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
  const queryClient = useQueryClient();
  let daysLeft = "-";
  // Percentage of the current round still REMAINING: the bar is full at the
  // start of the round and empties as it counts down (matches "days left").
  let remainingPercent = 0;
  let roundStartLabel = "-";
  let roundEndLabel = "-";

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

    roundStartLabel = formatDate(currentRoundStart);
roundEndLabel = formatDate(currentRoundEnd);

    if (timeLeft > 0) {
      const _daysLeft = Math.floor(timeLeft / (60 * 60 * 24));
      daysLeft = ${_daysLeft} ${_daysLeft === 1 ? "day" : "days"};

      const progressPercent = Math.min(
        100,
        ((now - currentRoundStart) / totalDuration) * 100,
      );
      remainingPercent = Math.max(0, 100 - progressPercent);
    } else {
      daysLeft = "0 days";
      remainingPercent = 0;
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
      <div className="w-full h-4 bg-paper-2 mt-4 mb-1 p-0.75">
        <div
          className="h-full bg-primary-blue transition-all"
          style={{ width: ${remainingPercent}% }}
        />
      </div>
      <div className="flex items-center justify-between text-sm opacity-70 mb-2">
        <span>Round started {roundStartLabel}</span>
        <span>Ends {roundEndLabel}</span>
      </div>
      {Boolean(Number(effectiveCircleStartTime)) && isActive && (
        <Countdown
          targetSeconds={Number(depositWindowEnd)}
          onComplete={() => {
            invalidateCircleReads(queryClient);
          }}
        />
      )}
    </div>
  );
};

export default DaysLeft;
**PR title:**

Fix round-progress bar: show time remaining + add start/end captions
**PR description:**

Addresses UX feedback (via Unai): the round-progress bar was unclear.

Problem: the bar filled with time elapsed in the round while the label said "days left" — opposite directions, no captions — so a near-empty bar next to "6 days left" felt contradictory.

Changes:
Invert the bar to represent time remaining (full at round start, empties to 0 as it counts down), matching the "days left" fra
ming.
Add captions under the bar: "Round started {date}" (left) and "Ends {date}" (right).

Note: not build-tested locally by the author of the change — please review. Color/spacing tokens (opacity-70) may want aligning with the design system.
```
