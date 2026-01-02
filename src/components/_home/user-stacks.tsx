"use client";

import Loading from "@/app/loading";
import { useUserCirclesList } from "@/hooks/use-user-circles-list";
import { Address } from "viem";
import CardCarousel from "../card-carousel";

const HomeUserStacks = ({ address }: { address: Address }) => {
	const { circles, isLoading, error } = useUserCirclesList(address);

	return <div>
		{isLoading ? <Loading /> : <CardCarousel circles={circles} />}
	</div>
};

export default HomeUserStacks;
