import { Body, Heading3, LiftedButton, LoginButton } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import { useCircleStatus } from "@/hooks/use-circle-status";
import Loading from "@/app/loading";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import LastClaim from "./last-claim";
import { ReactNode } from "react";
import { Address, formatEther } from "viem";
import ClaimButton from "@/components/claim-button";
import { useGetLastClaimed } from "@/hooks/use-get-last-claimed";
import { formatRelativeTime } from "@/utils/time";

const TotalStacked = ({
	id,
	status,
	userCircleData,
}: {
	id: string;
	status: ReturnType<typeof useCircleStatus>;
	userCircleData: ReturnType<typeof useUserCircleData>;
}) => {
	const { address } = useAccount();

	const claimableAmount = userCircleData.circleData?.canWithdraw
		? userCircleData.circleData?.circleInfo.depositAmount *
		  BigInt(userCircleData.circleData?.totalRounds)
		: BigInt(0);
	let amount: string | number = "-";

	let wholePart = "-";
	let fractionalPart = "";
	let msg: ReactNode = "";

	const circleNotStarted =
		userCircleData.circleData &&
		userCircleData.circleData.circleInfo.effectiveCircleStartTime ===
			BigInt(0);

	if (userCircleData.circleData) {
		if (circleNotStarted) {
			msg = "You can claim now or  later.";
		} else {
			// amount = Number(formatEther(claimableAmount));
			// wholePart = Math.floor(amount).toString();
			// fractionalPart = amount.toFixed(2).split(".")[1];
			// amount = amount.toFixed(2);

			// msg = (
			// 	<Body bold>
			// 		<span>You already claimed your sum. </span>
			// 		<span className="font-normal">
			// 			Continue the depositing.
			// 		</span>
			// 	</Body>
			// );
			msg = "You can claim now or later.";
		}
	}

	return (
		<section
			className={cn(
				"border border-[#CBE9E5] bg-paper-0 py-8 px-5 mb-4.25 md:mb-0 md:order-2 md:flex-1 md:max-w-112.75",
				!address && "flex flex-col items-center justify-center"
			)}
		>
			<Heading3 className="pb-3.5 border-b border-paper-2 text-center mb-4.25 text-2xl font-bold w-full">
				Total stacked for you
			</Heading3>
			{!address ? (
				<div className="h-full w-full flex items-center justify-center">
					<LoginButton app="stacks" status="NOT_CONNECTED" />
				</div>
			) : (
				<>
					{status.isLoading ? (
						<div className="flex items-center justify-center">
							<Loading />
						</div>
					) : (
						<>
							<div className="py-4 flex flex-col gap-4 items-center mb-4.25">
								<p className="text-h2 text-surface-ink opacity-50">
									<span>${wholePart}</span>
									{fractionalPart && (
										<span className="text-[2.21rem] text-surface-grey-2">
											.{fractionalPart}
										</span>
									)}
								</p>
								<div className="flex flex-col gap-2 items-center">
									<Body className="text-surface-grey-2">
										{amount} $BREAD
									</Body>
									<Body className="text-xs">{msg}</Body>
								</div>
							</div>
							<LastClaim
								id={id}
								effectiveCircleStartTime={
									userCircleData.circleData?.circleInfo
										.effectiveCircleStartTime
								}
							/>

							{circleNotStarted ? (
								<LiftedButton
									disabled
									width="full"
									className="font-semibold text-paper-main"
								>
									Awaiting start
								</LiftedButton>
							) : typeof amount === "number" && amount > 0 ? (
								<ClaimButton
									circleId={BigInt(id)}
									amount={amount}
								/>
							) : (
								<LastClaimStatus
									address={address}
									circleId={id}
								/>
							)}
						</>
					)}
				</>
			)}
		</section>
	);
};

function LastClaimStatus({
	address,
	circleId,
}: {
	address: Address;
	circleId: string;
}) {
	const { data } = useGetLastClaimed({
		circleId,
		accountAddress: address,
		enabled: true,
	});

	if (!data) return null;

	return (
		<LiftedButton
			disabled
			width="full"
			className="font-semibold text-paper-main"
		>
			Claimed {formatRelativeTime(data.timestamp)}
		</LiftedButton>
	);
}

export default TotalStacked;
