import { DepositInterval } from "@/interfaces/deposit-interval";
import { clientEnv } from "@/lib/env";
import { isLocalMode } from "@/lib/network-mode";

// Hardcoded (NOT env-driven — the env schema requires >= 2 entries): one
// 30-day interval, long enough that local rounds only ever advance via the
// "Next round" button.
const LOCAL_DEPOSIT_INTERVALS: DepositInterval[] = [
  { id: "1month", label: "monthly", seconds: 2592000, description: "30 days" },
];

export const DEPOSIT_INTERVALS: DepositInterval[] = isLocalMode()
  ? LOCAL_DEPOSIT_INTERVALS
  : clientEnv.NEXT_PUBLIC_DEPOSIT_INTERVALS;

export const getIntervalById = (id: string) =>
  DEPOSIT_INTERVALS.find((i) => i.id === id);

export const getIntervalBySeconds = (seconds: number) =>
  DEPOSIT_INTERVALS.find((i) => i.seconds === seconds);

export function formatSecondsHuman(seconds: number): string {
  if (seconds < 3600)
    return `${seconds / 60} min${seconds / 60 !== 1 ? "s" : ""}`;

  if (seconds < 86400)
    return `${seconds / 3600} hour${seconds / 3600 !== 1 ? "s" : ""}`;

  if (seconds < 604800)
    return `${seconds / 86400} day${seconds / 86400 !== 1 ? "s" : ""}`;

  return `${(seconds / 604800).toFixed(1).replace(/\.0$/, "")} week${seconds / 604800 !== 1 ? "s" : ""}`;
}

export function splitIntervalId(str: string): [number, string] {
  const [numPart, stringPart] = str.split(/(\d+)/).filter(Boolean);
  return [parseInt(numPart), stringPart];
}
