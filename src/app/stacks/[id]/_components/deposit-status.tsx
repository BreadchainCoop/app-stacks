import Alert, { AlertProps } from "@/components/alert";
import { Body, Heading3, LiftedButton, LoginButton } from "@breadcoop/ui";
import { CalendarDotsIcon, CalendarStarIcon } from "@phosphor-icons/react/ssr";
import { useCircleStatus } from "@/hooks/use-circle-status";
import Loading from "@/app/loading";
import { useCircleInfo } from "@/hooks/use-circle-info";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { useAccount } from "wagmi";
import { getuserCircleStatus } from "@/lib/get-user-circle-status";
import { ICircleStatus } from "@/interfaces/circle";
import StartCircleButton from "@/components/start-circle-button";
import LocalLiftedButton from "@/components/lifted-button";
import DepositButton from "@/components/deposit-button";
import { formatEther } from "viem";
import LastDeposit from "./last-deposit";
import DaysLeft from "./days-left";

const DepositStatus = ({
	id,
	status,
	circle,
	userCircleData,
}: {
	id: string;
	status: ReturnType<typeof useCircleStatus>;
	circle: ReturnType<typeof useCircleInfo>["circle"];
	userCircleData: ReturnType<typeof useUserCircleData>;
}) => {
	const { address } = useAccount();
	const formattedStatus = userCircleData.circleData
		? getuserCircleStatus(userCircleData.circleData, address, {
				includeDeposited: true,
				includeClaimable: false,
		  })
		: null;

	return (
		<section className="bg-paper-0 p-5 mb-4 *:mb-4 md:mb-0 md:order-1 md:flex-2 md:max-w-159.75">
			<header className="flex items-center justify-between border-b border-paper-2 pb-4">
				<Heading3 className="text-2xl">Deposit Status</Heading3>
				<LastDeposit
					id={id}
					status={formattedStatus?.status || null}
					isActive={status.isActive}
				/>
			</header>
			<DaysLeft
				depositWindowEnd={userCircleData.circleData?.depositWindowEnd}
				effectiveCircleStartTime={userCircleData.circleData?.circleInfo.effectiveCircleStartTime}
				currentIndex={userCircleData.circleData?.circleInfo.currentIndex}
				depositInterval={userCircleData.circleData?.circleInfo.depositInterval}
				isActive={status.isActive}
			/>
			{status.isLoading || userCircleData.isLoading ? (
				<div className="flex items-center justify-center">
					<Loading />
				</div>
			) : (
				<>
					{!userCircleData.circleData?.isMember ? (
						<Body>You are not a member of this circle.</Body>
					) : (
						<>
							{formattedStatus && (
								<>
									<Alert
										closeAble={false}
										variant={formattedStatus.variant}
										title={formattedStatus.title}
										description={formattedStatus.desc}
									/>
									{formattedStatus.status === "start" ? (
										<>
											{address ===
												userCircleData.circleData
													.circleInfo.owner && (
												<StartCircleButton
													circleId={BigInt(id)}
													amount={
														userCircleData
															.circleData
															.circleInfo
															.depositAmount
													}
													width="full"
												/>
											)}
										</>
									) : formattedStatus.status ===
									  "deposited" ? (
										<LocalLiftedButton
											width="full"
											className="text-paper-main lifted-button-disabled"
										>
											Deposited
										</LocalLiftedButton>
									) : formattedStatus.status ===
									  "payment_due" ? (
										<DepositButton
											className="font-bold"
											width="full"
											label={`Deposit ${formatEther(
												userCircleData.circleData
													.circleInfo.depositAmount
											)} BREAD`}
											amount={
												userCircleData.circleData
													.circleInfo.depositAmount
											}
											tokenAddress={
												userCircleData.circleData
													.circleInfo.token
											}
											circleId={BigInt(id)}
										/>
									) : formattedStatus.status ===
									  "completed" ? (
										<LiftedButton
											disabled
											width="full"
											className="font-bold text-paper-main"
										>
											Stacks Ended
										</LiftedButton>
									) : null}
								</>
							)}
						</>
					)}
				</>
			)}
		</section>
	);
};

export default DepositStatus;
