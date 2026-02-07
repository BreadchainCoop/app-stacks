import LocalLiftedButton from "@/components/lifted-button";
import {
	Body,
	Heading3,
	LoginButton,
	Logo,
	useConnectedUser,
} from "@breadcoop/ui";
import {
	ArrowLeftIcon,
	ArrowsClockwiseIcon,
	CalendarIcon,
	Icon,
	LayoutIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import { ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { StackFormSchemaData } from "./schema";
import { useWriteContract } from "wagmi";
import { savingCirclesAbi } from "../../../../lib/abis/saving-circles";
import {
	BREAD_TOKEN_ADDRESS,
	SAVING_CIRCLES_CONTRACT_ADDRESS,
} from "../../../../lib/constants";
import { parseEther, parseEventLogs } from "viem";
import { SECONDS_PER_DAY } from "@/utils/solidity";
import { useModal } from "@/components/modal/context";
import { sleep } from "@/utils/sleep";
import { waitForTransactionReceipt } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import { clientEnv } from "@/lib/env";

const StackOverviewForm = ({ onBack }: { onBack: () => void }) => {
	const modal = useModal();
	const form = useFormContext<StackFormSchemaData>();
	const depositInterval = form.watch("depositInterval");
	const members = form.watch("members");
	const frequency = members ? `${members}x` : "-";
	const freqDeposit = form.watch("depositAmount") || 0;
	const total = (members || 0) * (freqDeposit || 0);
	const { user } = useConnectedUser();
	const writeContract = useWriteContract();

	const createStack = async (data: StackFormSchemaData) => {
		try {
			// This is just for typescript check. user is available at this point
			if (user.status !== "CONNECTED") return;

			modal.setModal({
				type: "STACK_CREATION_INIT",
				name: data.name,
				status: "awaiting",
			});

			const hash = await writeContract.writeContractAsync({
				address: SAVING_CIRCLES_CONTRACT_ADDRESS,
				abi: savingCirclesAbi,
				functionName: "create",
				args: [
					{
						owner: user.address,
						currentIndex: BigInt(0),
						depositAmount: parseEther(String(data.depositAmount)),
						token: BREAD_TOKEN_ADDRESS,
						depositInterval:
							SECONDS_PER_DAY *
							BigInt(data.depositInterval === "weekly" ? 7 : 30),
						effectiveCircleStartTime: BigInt(0),
						circleEnd: BigInt(0),
					},
				],
			});

			modal.setModal({
				type: "STACK_CREATION_INIT",
				name: data.name,
				status: "approved",
			});

			const receipt = await waitForTransactionReceipt(wagmiConfig, {
				hash,
				confirmations: 1,
			});

			const logs = parseEventLogs({
				abi: savingCirclesAbi,
				logs: receipt.logs,
				eventName: "CircleCreated",
			});

			const circleCreatedEvent = logs.find(
				(log) => (log as any).eventName === "CircleCreated",
			);

			const newCircleId = (circleCreatedEvent as any).args.id as bigint;

			modal.setModal({
				type: "STACK_CREATION_INIT",
				name: data.name,
				status: "successful",
			});

			const circle = {
				name: data.name,
				id: newCircleId.toString(),
				duration: `${data.members} ${data.depositInterval.slice(
					0,
					-2,
				)}${data.members === 1 ? "" : "s"}`.trim(),
				deposit: data.depositAmount,
				total: data.members * data.depositAmount,
				members: data.members,
			};

			await sleep(500);

			modal.setModal({
				type: "STACK_CREATION_SUCCESS",
				circle,
			});

			let localCircles = JSON.parse(
				localStorage.getItem("circles") || "{}",
			);
			localCircles = {
				...localCircles,
				[circle.id]: {
					name: circle.name,
					owner: user.address, // Store the owner for reference
				},
			};
			localStorage.setItem("circles", JSON.stringify(localCircles));

			form.reset();
		} catch (error) {
			console.log("__ ERROR __", error);

			modal.setModal({ type: "STACK_CREATION_FAILED" });
		}
	};

	return (
		<section className="bg-paper-0 p-6 flex flex-col gap-4 shadow-[0px_4px_12px_0px_#1B201A26] lg:bg-paper-main lg:border lg:border-blue-0">
			<header className="">
				<Heading3 className="mb-4 pb-4 border-b border-blue-0 text-2xl">
					Overview
				</Heading3>
				<Body className="text-surface-grey">
					Please review your stacks.
				</Body>
			</header>
			<div className="flex flex-col gap-4 pb-4 border-b border-blue-0">
				<ReviewedRow
					RIcon={LayoutIcon}
					title="Name"
					body={form.watch("name") || "-"}
				/>
				<ReviewedRow
					RIcon={CalendarIcon}
					title="Members deposit every"
					body={form.watch("depositInterval")?.slice(0, -2) || "-"}
					capitalize
				/>
				<ReviewedRow
					RIcon={ArrowsClockwiseIcon}
					title="Deposit frequency"
					body={frequency}
				/>
			</div>
			<div className="flex flex-col gap-2">
				<Body className="text-sm text-surface-grey">
					1 BREAD = 1 USD
				</Body>
				<BreadRow
					label={
						<>
							<span className="capitalize">
								{depositInterval}
							</span>{" "}
							deposit
						</>
					}
					amount={freqDeposit}
				/>
				<BreadRow
					label="Total Stacked per member"
					amount={total.toFixed(2)}
					colored
				/>
			</div>
			<div className="px-6 py-3 bg-paper-1">
				<Body className="text-xs text-surface-grey-2">
					This Stacks group is not a regulated savings product.
				</Body>
				<Body className="text-xs text-surface-grey-2">
					The premium is provided on a discretionary basis with the
					Stack members having the final say on which claims are paid.
					Read the complete cover wording here.
				</Body>
			</div>
			<div className="flex flex-col gap-4">
				{user.status === "CONNECTED" ? (
					<LocalLiftedButton
						width="full"
						leftIcon={<SparkleIcon size={24} />}
						onClick={form.handleSubmit(createStack)}
						type="submit"
					>
						Create Stack
					</LocalLiftedButton>
				) : (
					<LoginButton
						app="stacks"
						status={user.status}
						isProd={clientEnv.NEXT_PUBLIC_NODE_ENV === "production"}
					/>
				)}
				<LocalLiftedButton
					className="lg:hidden"
					preset="secondary"
					width="full"
					leftIcon={<ArrowLeftIcon size={24} />}
					onClick={onBack}
					type="button"
				>
					Back
				</LocalLiftedButton>
			</div>
		</section>
	);
};

function ReviewedRow({
	RIcon,
	title,
	body,
	capitalize,
}: {
	RIcon: Icon;
	title: string;
	body: string;
	capitalize?: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<div className="flex items-center justify-start gap-2">
				{<RIcon size={24} className="fill-primary-blue" />}
				<Body className="text-surface-grey-2">{title}</Body>
			</div>
			<Body
				bold
				className={`text-surface-ink ${capitalize ? "capitalize" : ""}`}
			>
				{body}
			</Body>
		</div>
	);
}

function BreadRow({
	label,
	amount,
	colored,
}: {
	label: ReactNode;
	amount: string | number;
	colored?: boolean;
}) {
	return (
		<div className="flex items-center justify-between">
			<Body>{label}</Body>
			<div
				className={`p-1 shrink-0 border ${
					colored ? "border-system-green" : "border-paper-2"
				}`}
			>
				<Logo size={24} variant="square" text={`${amount} BREAD`} />
			</div>
		</div>
	);
}

export default StackOverviewForm;
