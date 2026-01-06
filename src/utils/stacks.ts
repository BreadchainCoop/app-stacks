import { SECONDS_PER_DAY } from "./solidity";

export const parseCircleIntervalToDate = (depositInterval: bigint) => {
	const interval = Number(depositInterval / SECONDS_PER_DAY);
	const label = interval % 30 === 0 ? "month" : "week";

	return { interval, label };
};
