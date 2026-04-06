import { getIntervalBySeconds, splitIntervalId } from "./deposit-interval";

export const parseCircleIntervalToDate = (depositInterval: bigint) => {
  const seconds = Number(depositInterval);
  const matched = getIntervalBySeconds(seconds);

  if (matched) {
    const [n, unit] = splitIntervalId(matched.id);
    const label = n === 1 ? `a ${unit}` : `every ${n} ${unit}`;
    return { interval: seconds, label };
  }

  // fallback for unknown intervals
  const days = Math.round(seconds / 86400);

  return {
    interval: days,
    label: days === 1 ? "a day" : `every ${days} days`,
  };
};
