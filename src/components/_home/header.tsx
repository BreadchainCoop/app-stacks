"use client";

import { Body, Heading2 } from "@breadcoop/ui";
import { useAccount } from "wagmi";
import LocalLiftedButton from "../lifted-button";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react";

const HomeHeader = () => {
	const { isConnected } = useAccount();
	// const isConnected = false;

	return (
		<header className="mb-6 md:flex md:items-center md:justify-between">
			<div className="flex flex-col gap-6 mb-6 md:mb-0">
				<Heading2 className="m-0 p-0 text-2xl leading-6">
					{isConnected ? "All Stacks" : "Your Stacks"}
				</Heading2>
				<Body>
					{isConnected
						? "Peek into your Stacks dashboard."
						: "Peek into all active Stack groups."}
				</Body>
			</div>
			<Link href="/new" className="lifted-button-container md:w-auto">
				<LocalLiftedButton leftIcon={<PlusIcon />}>
					Create new Stack
				</LocalLiftedButton>
			</Link>
		</header>
	);
};

export default HomeHeader;
