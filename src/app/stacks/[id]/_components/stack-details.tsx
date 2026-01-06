import { useCircleInfo } from "@/hooks/use-circle-info";
import { useCircleMembers } from "@/hooks/use-circle-members";
import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { SECONDS_PER_DAY } from "@/utils/solidity";
import { Body, Heading3, LoginButton, Logo } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";
import { formatEther, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";

function TotalAmountStacked({ circleId }: { circleId: string }) {
	const { data: circleData } = useReadContract({
		address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
		abi: savingCirclesViewerAbi,
		functionName: "getUserCircleData",
		args: [zeroAddress, BigInt(circleId)],
		chainId: getDefaultChainId(),
	});

	let totalAmountSaved = "-";

	if (circleData) {
		totalAmountSaved = formatEther(
			circleData.circleInfo.depositAmount *
				BigInt(circleData.totalRounds) *
				BigInt(circleData.completedRounds) +
				circleData.totalPoolBalance
		);
	}

	return (
		<div className="shrink-0 flex items-center justify-start flex-wrap gap-2">
			<Logo
				variant="square"
				text={Number(totalAmountSaved || "0").toFixed(2)}
				size={24}
			/>
			<Body className="mt-[0.2rem]">BREAD</Body>
		</div>
	);
}

const StackDetailsTotal = ({
	intervalLabel,
	depositPerRound,
	circleId,
}: {
	intervalLabel: "month" | "week";
	depositPerRound: string;
	circleId: string;
}) => {
	const { address } = useAccount();
	const depositPerRoundWholePart = Math.floor(Number(depositPerRound));
	const depositPerRoundFractionalPart = Math.floor(
		(Number(depositPerRound) - depositPerRoundWholePart) * 100
	)
		.toString()
		.padStart(2, "0");

	return (
		<div className="flex flex-col gap-6 mb-3 md:mb-0 md:flex-1 md:justify-end">
			{address ? (
				<>
					<p className="flex items-baseline justify-start flex-nowrap">
						<span className="text-h1 text-[5rem] leading-[-3%]">
							{depositPerRoundWholePart}
						</span>
						<span className="text-h2 text-5xl leading-[-2%] text-surface-grey-2">
							.{depositPerRoundFractionalPart}
						</span>
					</p>
					<div className="flex flex-col items-end -mt-6">
						<Logo
							variant="square"
							text="BREAD"
							className="[&+span]:font-normal"
							size={24}
						/>
						<Body className="text-surface-grey-2">
							Total stacked per {intervalLabel}
						</Body>
					</div>
					<div className="flex flex-wrap gap-4 flex-row items-center justify-between">
						<Body className="shrink-0 text-surface-grey-2">
							Total stacked by group
						</Body>
						<TotalAmountStacked circleId={circleId} />
					</div>
				</>
			) : (
				<div className="h-full flex items-center justify-center">
					<LoginButton status="NOT_CONNECTED" app="stacks" />
				</div>
			)}
		</div>
	);
};

const StackDetailsBreakdownRow = ({
	label,
	children,
}: {
	children: ReactNode;
	label: string;
}) => {
	return (
		<div className="bg-paper-1 py-2 px-4 flex flex-col gap-2.5 mb-2 last:mb-0 md:flex-row md:justify-between">
			<Body className="text-surface-grey-2">{label}</Body>
			<div className="flex items-center gap-2">{children}</div>
		</div>
	);
};

const StackDetailsBreakdown = ({
	circle,
	intervalLabel,
	depositInterval,
	totalRounds,
	roundsLeft,
}: {
	circle: Exclude<ReturnType<typeof useCircleInfo>["circle"], undefined>;
	intervalLabel: "month" | "week";
	depositInterval: number;
	totalRounds: number | string;
	roundsLeft: number | string;
}) => {
	const capitalizedLabel = `${intervalLabel[0].toUpperCase()}${intervalLabel.slice(
		1
	)}`;

	return (
		<div className="md:flex-1">
			<StackDetailsBreakdownRow label={`${capitalizedLabel}ly deposit`}>
				<>
					<Logo
						size={24}
						text={formatEther(circle?.depositAmount)}
						variant="square"
					/>
					<Body className="mt-[0.3rem]">BREAD</Body>
				</>
			</StackDetailsBreakdownRow>
			<StackDetailsBreakdownRow label="Total deposit rounds completed">
				<>
					<p className="text-h2 leading-6 tracking-[-2%] text-2xl">
						{+circle.currentIndex.toString()}
					</p>
					<p className="text-h3 leading-[100%] text-2xl text-surface-grey">
						out of {totalRounds}
					</p>
				</>
			</StackDetailsBreakdownRow>
			<StackDetailsBreakdownRow label="Members deposit every">
				<>
					<CalendarDotsIcon size={24} className="fill-blue-2" />
					<p className="text-h2 text-2xl leading-6 tracking-[-2%]">
						{depositInterval}
					</p>
					<p>Days</p>
				</>
			</StackDetailsBreakdownRow>
			<StackDetailsBreakdownRow label="Time left">
				<>
					<p className="text-h2 leading-6 tracking-[-2%] text-2xl">
						{roundsLeft}
					</p>
					<p>{capitalizedLabel}s</p>
				</>
			</StackDetailsBreakdownRow>
		</div>
	);
};

const StackDetails = ({
	id,
	circle,
}: {
	id: string;
	circle: Exclude<ReturnType<typeof useCircleInfo>["circle"], undefined>;
}) => {
	const { data: members } = useCircleMembers(BigInt(id));
	const { address } = useAccount();
	const { data: creationTimestamp } = useGetCircleCreated({ circleId: id });

	const depositInterval = Number(circle.depositInterval / SECONDS_PER_DAY);
	const intervalLabel = depositInterval % 30 === 0 ? "month" : "week";

	const depositPerRound = circle.depositAmount * BigInt(members?.length || 0);
	const roundsLeft =
		BigInt(members?.length || 0) - BigInt(circle?.currentIndex || 0);

	return (
		<section className="bg-paper-0 flex flex-col gap-6 p-4">
			<header className="flex flex-col gap-4 border-b border-paper-2 pb-4 md:flex-row md:justify-between">
				<Heading3 className="text-2xl">Stacks details</Heading3>
				{address ? (
					<div className="flex items-center justify-between gap-4">
						<div>
							<Body className="text-xs">
								<span className="text-surface-grey inline-block mr-1">
									ID:
								</span>
								<span className="text-surface-ink">{id}</span>
							</Body>
						</div>
						<div className="flex items-center justify-center gap-2">
							<Body className="text-xs text-surface-grey">
								Created on:
							</Body>
							<div className="flex items-center justify-center">
								<CalendarDotsIcon
									size={16}
									className="fill-blue-2 mr-2"
								/>
								{creationTimestamp ? (
									<>
										<Body className="text-surface-ink text-xs">
											{new Intl.DateTimeFormat(
												"en-GB"
											).format(creationTimestamp)}
										</Body>
									</>
								) : (
									<Body className="text-surface-ink text-xs">
										-
									</Body>
								)}
							</div>
						</div>
					</div>
				) : null}
			</header>
			<div className="md:flex md:justify-between md:gap-3">
				<StackDetailsTotal
					intervalLabel={intervalLabel}
					depositPerRound={formatEther(depositPerRound)}
					circleId={id}
				/>
				<StackDetailsBreakdown
					circle={circle}
					intervalLabel={intervalLabel}
					depositInterval={depositInterval}
					totalRounds={members?.length || "-"}
					roundsLeft={roundsLeft.toString()}
				/>
			</div>
		</section>
	);
};

export default StackDetails;
