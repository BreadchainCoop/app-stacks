import { formatIntervalFromSeconds } from "@/lib/deposit-intervals";

export const parseCircleIntervalToDate = (depositInterval: bigint) => {
  const { summaryLabel } = formatIntervalFromSeconds(depositInterval);

  return { label: summaryLabel };
};
