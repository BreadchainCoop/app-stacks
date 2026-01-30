import { Body, Heading2, LiftedButton } from "@breadcoop/ui";
import { useModal } from "./context";
import { ReactNode } from "react";
import clsx from "clsx";
import {
	CheckCircleIcon,
	Icon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import { CircularProgressIcon } from "../icons/circular-progress";

interface ModalHeaderProps {
	title: string;
}

export const ModalHeader = (props: ModalHeaderProps) => {
	const modal = useModal();
	return (
		<header className="flex items-center justify-between">
			<Heading2 className="text-2xl leading-6">{props.title}</Heading2>
			<button type="button" onClick={() => modal.setModal(null)}>
				<CloseIcon />
			</button>
		</header>
	);
};

export const ModalContainer = ({
	children,
	className,
	status,
}: {
	children: ReactNode;
	className?: string;
	status?: "error" | "success" | "loading";
}) => {
	return (
		<div className="h-screen max-h-[100vh] fixed w-screen top-0 z-40 pointer-events-none flex items-center justify-center">
			<div
				className={clsx(
					"pointer-events-auto relative max-h-[calc(100vh-1rem)] overflow-y-auto w-11/12 max-w-[30rem] flex flex-col items-center justify-center gap-6 bg-paper-0 shadow-[0px_4px_12px_0px_#1B201A26] p-5 *:w-full border transition-colors",
					status === "success"
						? "border-system-green"
						: status === "error"
							? "border-system-red"
							: "border-transparent",
					className,
				)}
			>
				{children}
			</div>
		</div>
	);
};

function CloseIcon() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M18.75 5.25L5.25 18.75"
				stroke="#1C5BB9"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<path
				d="M18.75 18.75L5.25 5.25"
				stroke="#1C5BB9"
				strokeWidth="1.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
		</svg>
	);
}

export const ModalStatus = ({
	status,
	statusMsg,
	icon,
	msg,
	showLoadingMsg = true,
}: {
	status: "loading" | "success" | "error";
	statusMsg?: string;
	icon?: Icon;
	msg?: string;
	showLoadingMsg?: boolean;
}) => {
	return (
		<div className="flex items-center justify-center flex-col gap-2">
			{status === "error" ? (
				<>
					<WarningCircleIcon size={48} className="fill-system-red" />
					<Body bold className="text-system-red">
						{statusMsg || "Transaction failed"}
					</Body>
					{/* <Body bold className="text-surface-grey">
						{msg}
					</Body> */}
				</>
			) : status === "success" ? (
				<>
					<CheckCircleIcon size={48} className="fill-system-green" />
					<Body bold className="text-system-green">
						{/* Transaction successful */}
						{statusMsg || "Complete"}
					</Body>
					{/* <Body bold className="text-surface-grey">
						{msg}
					</Body> */}
				</>
			) : (
				<>
					<CircularProgressIcon />
					{showLoadingMsg && (
						<Body bold className="text-primary-blue">
							Loading...
						</Body>
					)}
				</>
			)}
			{msg && (
				<Body bold className="text-surface-grey">
					{msg}
				</Body>
			)}
		</div>
	);
	// if (status === "error")
	// 	return <WarningCircleIcon size={48} className="fill-system-red" />;

	// if (status === "success")
	// 	return <CheckCircleIcon size={48} className="fill-system-green" />;

	// return <CircularProgressIcon />;
};

export const ModalCloseBtn = () => {
	const { setModal } = useModal();

	return (
		<LiftedButton
			onClick={() => setModal(null)}
			preset="burn"
			width="full"
			className="text-system-red font-bold"
		>
			Close
		</LiftedButton>
	);
};
