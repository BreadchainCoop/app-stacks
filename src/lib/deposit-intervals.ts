import {
  SECONDS_PER_DAY,
  SECONDS_PER_HOUR,
  SECONDS_PER_MINUTE,
} from "@/utils/solidity";

export const DEPOSIT_INTERVAL_VALUES = [
  "five_minutes",
  "hourly",
  "daily",
  "weekly",
  "monthly",
] as const;

export type DepositIntervalValue = (typeof DEPOSIT_INTERVAL_VALUES)[number];

type DepositIntervalOption = {
  value: DepositIntervalValue;
  label: string;
  description: string;
  summaryLabel: string;
  seconds: bigint;
};

export const DEPOSIT_INTERVAL_OPTIONS: readonly DepositIntervalOption[] = [
  {
    value: "five_minutes",
    label: "Every 5 minutes",
    description: "(every 5 minutes)",
    summaryLabel: "5 minutes",
    seconds: SECONDS_PER_MINUTE * BigInt(5),
  },
  {
    value: "hourly",
    label: "Hourly",
    description: "(every 1 hour)",
    summaryLabel: "1 hour",
    seconds: SECONDS_PER_HOUR,
  },
  {
    value: "daily",
    label: "Daily",
    description: "(every 1 day)",
    summaryLabel: "1 day",
    seconds: SECONDS_PER_DAY,
  },
  {
    value: "weekly",
    label: "Weekly",
    description: "(every 7 days)",
    summaryLabel: "1 week",
    seconds: SECONDS_PER_DAY * BigInt(7),
  },
  {
    value: "monthly",
    label: "Monthly",
    description: "(every 30 days)",
    summaryLabel: "1 month",
    seconds: SECONDS_PER_DAY * BigInt(30),
  },
] as const;

export const DEFAULT_DEPOSIT_INTERVAL: DepositIntervalValue = "weekly";

const optionsByValue = new Map(
  DEPOSIT_INTERVAL_OPTIONS.map((option) => [option.value, option])
);

export const isDepositIntervalValue = (
  value: string | null | undefined
): value is DepositIntervalValue =>
  Boolean(value && optionsByValue.has(value as DepositIntervalValue));

export const getDepositIntervalOption = (value: DepositIntervalValue) => {
  const option = optionsByValue.get(value);
  if (!option) {
    throw new Error(`Unsupported deposit interval: ${value}`);
  }
  return option;
};

export const getDepositIntervalSeconds = (value: DepositIntervalValue) =>
  getDepositIntervalOption(value).seconds;

const pluralize = (value: number, singular: string, plural?: string) => {
  if (value === 1) return singular;
  return plural || `${singular}s`;
};

export const formatIntervalFromSeconds = (depositInterval: bigint) => {
  const knownInterval = DEPOSIT_INTERVAL_OPTIONS.find(
    (option) => option.seconds === depositInterval
  );

  if (knownInterval) {
    return {
      summaryLabel: knownInterval.summaryLabel,
    };
  }

  const seconds = Number(depositInterval);
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return { summaryLabel: "unknown interval" };
  }

  if (seconds % Number(SECONDS_PER_DAY) === 0) {
    const days = seconds / Number(SECONDS_PER_DAY);
    return { summaryLabel: `${days} ${pluralize(days, "day")}` };
  }

  if (seconds % Number(SECONDS_PER_HOUR) === 0) {
    const hours = seconds / Number(SECONDS_PER_HOUR);
    return { summaryLabel: `${hours} ${pluralize(hours, "hour")}` };
  }

  if (seconds % Number(SECONDS_PER_MINUTE) === 0) {
    const minutes = seconds / Number(SECONDS_PER_MINUTE);
    return { summaryLabel: `${minutes} ${pluralize(minutes, "minute")}` };
  }

  return { summaryLabel: `${seconds} ${pluralize(seconds, "second")}` };
};
