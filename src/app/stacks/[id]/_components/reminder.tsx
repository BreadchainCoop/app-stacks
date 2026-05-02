"use client";

import Reminder from "@/components/reminder";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import {
  CalendarEvent,
  RecurrenceRule,
  RecurrenceFrequency,
} from "@/components/reminder/interfaces";

type CircleData = Exclude<
  ReturnType<typeof useUserCircleData>["circleData"],
  undefined
>;

function buildRecurrenceRule(
  depositIntervalSeconds: number,
  roundsLeft: number
): RecurrenceRule | undefined {
  // No recurrence on the last round, or for sub-day intervals
  if (roundsLeft <= 1 || depositIntervalSeconds < 86_400) return undefined;

  let frequency: RecurrenceFrequency;
  let interval: number;

  if (depositIntervalSeconds < 604_800) {
    frequency = "DAILY";
    interval = Math.round(depositIntervalSeconds / 86_400);
  } else if (depositIntervalSeconds < 2_592_000) {
    frequency = "WEEKLY";
    interval = Math.round(depositIntervalSeconds / 604_800);
  } else {
    frequency = "MONTHLY";
    interval = Math.round(depositIntervalSeconds / 2_592_000);
  }

  return {
    frequency,
    ...(interval > 1 ? { interval } : {}),
    count: roundsLeft,
  };
}

interface ReminderProps extends Pick<CalendarEvent, "startTime"> {
  id: string;
  depositAmount: string;
  circle: CircleData;
}

const StackReminder = ({
  id,
  depositAmount,
  startTime,
  circle,
}: ReminderProps) => {
  const { data: stackMetadata } = useStackSupabase(id, true);

  const depositIntervalSeconds = Number(circle.circleInfo.depositInterval);
  const roundsLeft = Number(circle.totalRounds - circle.completedRounds);
  const recurrence = buildRecurrenceRule(depositIntervalSeconds, roundsLeft);

  const calendar: CalendarEvent = {
    title: `Make Stack Deposit - ${stackMetadata?.stackname}`,
    description: `Reminder to make your deposit:\n\nAmount: ${depositAmount}\nStack: ${stackMetadata?.stackname}\n\n🔗 Click here to view the stack and complete your deposit:\n${window.location.href}\n\nThank you!`,
    startTime,
    endTime: new Date(startTime.getTime() + 24 * 60 * 60 * 1000),
    recurrence,
    fileName: `${stackMetadata?.stackname || "deposit"}-reminder`,
  };

  return <Reminder calendar={calendar} label="Add deposit reminder" />;
};

export default StackReminder;
