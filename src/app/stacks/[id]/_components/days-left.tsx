"use client";

import { Body } from "@breadcoop/ui";
import { CalendarStarIcon } from "@phosphor-icons/react";

const DaysLeft = ({
	depositWindowEnd,
	isActive,
}: {
	depositWindowEnd: bigint | undefined;
	isActive?: boolean;
}) => {
	let daysLeft = "-";
	let progressPercent = 0;

	if (depositWindowEnd && isActive) {
		const now = Date.now();
		const end = Number(depositWindowEnd) * 1000; // Convert to milliseconds
		const totalDuration = end - now;
		const timeLeft = end - now;

		if (timeLeft > 0 && totalDuration > 0) {
			let _daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
			daysLeft = `${_daysLeft} ${_daysLeft === 1 ? "day" : "days"}`;
			progressPercent =
				((totalDuration - timeLeft) / totalDuration) * 100;
		} else {
			daysLeft = "0 days";
			progressPercent = 100;
		}
	}

	return (
		<>
			<div>
				<div className="flex items-center justify-start gap-0.5">
					<CalendarStarIcon size={24} className="fill-blue-2" />
					<Body>Days left untill next deposit</Body>
				</div>
				<p className="text-h2 text-2xl leading-6 mt-2">{daysLeft}</p>
			</div>
			<div className="w-full h-4 bg-paper-2 my-4 p-0.75">
				<div
					className="h-full bg-primary-blue"
					style={{ width: `${progressPercent}%` }}
				/>
			</div>
		</>
	);
};

export default DaysLeft;
