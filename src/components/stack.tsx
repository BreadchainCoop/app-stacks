import {
	Body,
	Heading3,
	Chip,
	// LiftedButton
} from "@breadcoop/ui";
import { UsersIcon } from "./icons/users";
import { CoinIcon, CoinsIcon } from "./icons/coin";
import { CalendarIcon } from "./icons/calendar";
import LocalLiftedButton from "./lifted-button";
import Link from "next/link";
import {
	// HandWithdrawIcon,
	QuestionIcon,
} from "@phosphor-icons/react/ssr";
// import { useModal } from "./modal/context";
import ClaimButton from "./claim-button";
import { ICircleList } from "@/interfaces/circle";
import { formatEther } from "viem";
import DepositButton from "./deposit-button";
import { HandWithdrawIcon } from "@phosphor-icons/react";

const headerStatuses: Exclude<ICircleList["status"], undefined>[] = [
	"member",
	"payment_due",
];

const Stack = ({ stack }: { stack: ICircleList }) => {
	// const { setModal } = useModal();
	const depositAmount = formatEther(stack.depositAmount);

	const items = [
		{
			label: `${stack.totalMember} Members`,
			icon: <UsersIcon />,
			className: "",
		},
		{
			label: `Token: BREAD`,
			icon: <CoinIcon />,
			className: "hidden md:flex",
		},
		{
			label: `${depositAmount} BREAD a week`,
			icon: <CoinsIcon />,
			className: "",
		},
		{
			label: `Goal: ${Number(depositAmount) * stack.totalMember} BREAD`,
			icon: <CalendarIcon />,
			className: "hidden md:flex",
		},
	];

	return (
		<li className="border border-paper-1 p-6 flex flex-col gap-6 bg-paper-0 shadow-[0px_4px_12px_0px_#1B201A26] xl:max-w-94">
			<div className="flex flex-col gap-2">
				<Heading3 className="m-0 text-2xl font-bold">
					{/* {stack.title} */}
					Circle name
				</Heading3>
				<div className="flex items-center justify-between">
					<Body bold className="text-surface-grey">
						ID: {stack.id}
					</Body>
					{stack.status && headerStatuses.includes(stack.status) && (
						<Chip
							className={`font-bold border-current ${
								stack.status === "member"
									? "text-system-green"
									: "text-system-warning"
							}`}
						>
							{stack.status === "member"
								? "Member"
								: "Payment due"}
						</Chip>
					)}
				</div>
			</div>
			<div className="flex items-center justify-between gap-6">
				<div className="flex-2">
					<div className="flex items-center justify-between mb-2">
						<Body bold className="text-xs sm:text-base">
							Stack progress
						</Body>
						<Body bold className="text-xs sm:text-base">
							60%
						</Body>
					</div>
					<div className="w-full h-3.5 p-0.75 bg-paper-main">
						<div
							className="h-full bg-primary-blue"
							style={{ width: "60%" }}
						/>
					</div>
				</div>
				<div className="w-full max-w-max flex flex-col xl:hidden">
					<p className="text-h2 m-0 text-2xl leading-6 text-surface-grey-2">
						${formatEther(stack.totalPoolBalance || BigInt(0))}
					</p>
					<Body className="flex items-center justify-start gap-1 text-surface-grey">
						<span className="text-[0.625rem]">
							Total BREAD stacked
						</span>
						<span>
							<QuestionIcon
								size={16}
								className="fill-surface-grey"
							/>
						</span>
					</Body>
				</div>
			</div>
			<ul className="flex flex-col gap-2.5">
				{items.map((item) => {
					return (
						<li
							key={item.label}
							className={`flex gap-[0.3125rem] ${item.className}`}
						>
							<span className="text-primary-blue">
								{item.icon}
							</span>
							<Body bold className="text-surface-grey-2">
								{item.label}
							</Body>
						</li>
					);
				})}
			</ul>
			<div className="flex flex-col gap-3 mt-auto">
				{stack.status === "claimable" ? (
					<ClaimButton
						amount={
							Number(formatEther(stack.depositAmount)) *
							stack.totalMember
						}
						circleId={stack.id}
					/>
				) : stack.status === "payment_due" ? (
					<DepositButton
						circleId={stack.id}
						tokenAddress={stack.token}
						width="full"
						leftIcon={<HandWithdrawIcon />}
						amount={stack.depositAmount}
					/>
				) : null}
				{/* {stack.status === "claim" ? (
          <ClaimButton amount={stack.amount} />
        ) : stack.status === "payment_due" ? (
          <LocalLiftedButton
            className="font-bold"
            width="full"
            preset="primary"
            leftIcon={<HandWithdrawIcon />}
            onClick={() => {
              setModal({
                type: "DEPOSIT_INIT",
                amount: stack.amount,
              });
            }}
          >
            Deposit {stack.amount} BREAD
          </LocalLiftedButton>
        ) : stack.status === "retired" ? (
          <LiftedButton
            className="font-bold"
            width="full"
            preset={undefined}
            leftIcon={<HandWithdrawIcon />}
            disabled
          >
            Retired
          </LiftedButton>
        ) : null} */}
				<Link
					className="lifted-button-container"
					href={`/stacks/${stack.id.toString()}`}
				>
					<LocalLiftedButton className="font-bold" preset="secondary">
						View Details
					</LocalLiftedButton>
				</Link>
			</div>
		</li>
	);
};

export default Stack;
