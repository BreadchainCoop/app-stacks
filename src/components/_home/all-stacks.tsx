"use client";

import { dummyStacks } from "@/utils/stacks";
import { useAccount, useReadContract } from "wagmi";
import { STACKS_CONTRACT_ADDRESS } from "../../../lib/constants";
import { savingCirclesABI } from "../../../lib/abi";
import CardCarousel from "../card-carousel";

const HomeAllStacks = () => {
	const { isConnected, address } = useAccount();
	const _stacks = [...dummyStacks];
	// console.log("__ HOME ALL STACKS __", _stacks);
	// console.log({ address, STACKS_CONTRACT_ADDRESS });
	// const { data, isFetching, error } = useReadContract({
	// 	address: STACKS_CONTRACT_ADDRESS,
	// 	abi: savingCirclesABI,
	// 	functionName: "getMemberCircles",
	// 	args: [address!],
	// 	chainId: 31337,
	// });

	// console.log("__ DATA __", data);
	// console.log("__ ISFETCHING __", isFetching);
	// console.log("__ ERROR __", error);

	return (
		<section className="mt-6">
			{/* @ts-ignore Right */}
			{/* <StackCarousel items={_stacks} itemsPerPage={5} layout="vertical" /> */}
			{/* @ts-ignore Right */}
			<CardCarousel items={_stacks} />
		</section>
	);
};

export default HomeAllStacks;
