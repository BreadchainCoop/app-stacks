"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { useAccount } from "wagmi";
import {
	HandWithdrawIcon,
	StackIcon,
	StackOverflowLogoIcon,
	WarningIcon,
} from "@phosphor-icons/react";

const tabs = [
	{ label: "All your Stacks", id: "all", icon: StackIcon },
	{ label: "Funds to Claim", id: "claim", icon: HandWithdrawIcon },
	{ label: "Payments due", id: "due", icon: WarningIcon },
	{ label: "Past Stacks", id: "past", icon: StackOverflowLogoIcon },
];

const HomeTab = () => {
	const { isConnected } = useAccount();

	// if (!isConnected) return null;

	return (
		// <Suspense fallback={<TabSkeleton />}>
		<Suspense fallback={null}>
			<ProtectedTab />
		</Suspense>
	);
};

// // Loading skeleton component
// const TabSkeleton = () => {
// 	return (
// 		<nav className="border border-paper-2 bg-paper-0 p-2.5">
// 			<ul className="flex items-center justify-start gap-4 overflow-x-auto scrollbar-hidden">
// 				{tabs.map((tab) => (
// 					<li key={tab.id} className="shrink-0">
// 						<div className="font-bold flex items-center justify-center gap-2.5 py-1 px-4 border border-transparent text-surface-grey">
// 							<span>{<tab.icon size={20} />}</span>
// 							{tab.label}
// 						</div>
// 					</li>
// 				))}
// 			</ul>
// 		</nav>
// 	);
// };

const ProtectedTab = () => {
	const currentTab = useSearchParams().get("tab") || "all";

	return (
		<nav className="border border-paper-2 bg-paper-0 p-2.5 max-w-185.5">
			<ul className="flex items-center justify-start gap-4 overflow-x-auto scrollbar-hidden">
				{[...tabs].map((tab) => {
					return (
						<li key={tab.id} className="shrink-0">
							<Link
								href={`/?tab=${tab.id}`}
								className={`font-bold flex items-center justify-center gap-2.5 py-1 px-4 border transition-colors ${
									currentTab === tab.id
										? "text-surface-ink border-primary-blue"
										: "text-surface-grey border-transparent"
								}`}
							>
								<span
									className={`${
										currentTab === tab.id
											? "text-primary-blue"
											: ""
									}`}
								>
									<span>{<tab.icon size={20} />}</span>
								</span>
								{tab.label}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
};

// function StackIcon() {
// 	return (
// 		<svg
// 			width="20"
// 			height="20"
// 			viewBox="0 0 20 20"
// 			fill="none"
// 			xmlns="http://www.w3.org/2000/svg"
// 		>
// 			<path
// 				d="M2.5 13.75L10 18.125L17.5 13.75"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M2.5 10L10 14.375L17.5 10"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M2.5 6.25L10 10.625L17.5 6.25L10 1.875L2.5 6.25Z"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 		</svg>
// 	);
// }

// function Warning() {
// 	return (
// 		<svg
// 			width="20"
// 			height="20"
// 			viewBox="0 0 20 20"
// 			fill="none"
// 			xmlns="http://www.w3.org/2000/svg"
// 		>
// 			<path
// 				d="M11.1257 3.14219L17.9585 15.007C18.4375 15.843 17.8187 16.875 16.8328 16.875H3.16714C2.18121 16.875 1.56246 15.843 2.04136 15.007L8.87417 3.14219C9.36636 2.28594 10.6336 2.28594 11.1257 3.14219Z"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M10 11.25V8.125"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M10.125 14.0625C10.125 14.1315 10.069 14.1875 10 14.1875C9.93096 14.1875 9.875 14.1315 9.875 14.0625C9.875 13.9935 9.93096 13.9375 10 13.9375C10.069 13.9375 10.125 13.9935 10.125 14.0625Z"
// 				fill="currentcolor"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 			/>
// 		</svg>
// 	);
// }

// function Stackoverflow() {
// 	return (
// 		<svg
// 			width="20"
// 			height="20"
// 			viewBox="0 0 20 20"
// 			fill="none"
// 			xmlns="http://www.w3.org/2000/svg"
// 		>
// 			<path
// 				d="M3.75 11.875V16.875H16.25V11.875"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M6.875 13.75H13.125"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M7.41797 9.625L13.4555 11.243"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M9.01013 5.78125L14.4226 8.90625"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 			<path
// 				d="M11.543 2.48047L15.9625 6.9"
// 				stroke="currentcolor"
// 				strokeWidth="1.5"
// 				strokeLinecap="round"
// 				strokeLinejoin="round"
// 			/>
// 		</svg>
// 	);
// }

export default HomeTab;
