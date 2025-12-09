import LocalLiftedButton from "@/components/lifted-button";
import { Body, Heading3, Logo } from "@breadcoop/ui";
import {
	ArrowLeftIcon,
	ArrowsClockwiseIcon,
	CalendarIcon,
	Icon,
	LayoutIcon,
	SparkleIcon,
} from "@phosphor-icons/react";
import React, { MouseEventHandler, ReactNode } from "react";
import { useFormContext } from "react-hook-form";
import { StackFormSchemaData } from "./schema";
import { useAccount, useWriteContract } from "wagmi";
import { savingCirclesABI } from "../../../../../lib/abi";
import { STACKS_CONTRACT_ADDRESS } from "../../../../../lib/constants";
import { ethAddress, parseUnits } from "viem";
import { useRouter } from "next/navigation";

const StackOverviewForm = ({ onBack }: { onBack: () => void }) => {
	const router = useRouter();
	const form = useFormContext<StackFormSchemaData>();
	const depositInterval = form.watch("depositInterval");
	const members = form.watch("members");
	const frequency = members ? `${members}x` : "-";
	const freqDeposit = form.watch("depositAmount") || 0;
	const total = (members || 0) * (freqDeposit || 0);
	const { address } = useAccount();

	const writeContract = useWriteContract();

	const createStack = async (data: StackFormSchemaData) => {
		try {
			const result = await writeContract.writeContractAsync({
				abi: savingCirclesABI,
				functionName: "create",
				address: STACKS_CONTRACT_ADDRESS,
				args: [
					{
						owner: address!,
						members: [],
						currentIndex: BigInt(0),
						depositAmount: parseUnits(
							data.depositAmount.toString(),
							// tokenDecimals
							18
						),
						token: ethAddress,
						// depositInterval: BigInt(data.depositInterval),
						depositInterval: BigInt(1),
						circleStart: BigInt(Math.floor(Date.now() / 1000)),
						maxDeposits: BigInt(data.members),
					},
				],
			});

			router.push("/");
		} catch (error) {
			console.log("__ ERROR __", error);
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
					amount={total}
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
				<LocalLiftedButton
					width="full"
					leftIcon={<SparkleIcon size={24} />}
					onClick={form.handleSubmit(createStack)}
					type="submit"
				>
					Create Stack
				</LocalLiftedButton>
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
