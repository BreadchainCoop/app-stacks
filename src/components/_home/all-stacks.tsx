"use client";

import CardCarousel from "../card-carousel";
import { useAllCircles } from "@/hooks/use-all-circles";
import { Body, Heading2, useConnectedUser } from "@breadcoop/ui";
import Loading from "@/app/loading";
import { useAccount } from "wagmi";

const HomeAllStacks = () => {
	const { user } = useConnectedUser();
	const { data, isLoading } = useAllCircles();

	return (
		<section className="mt-6">
			{(user.status === "CONNECTED" ||
				user.status === "NOT_CONNECTED") && (
				<div className="flex flex-col gap-6 mb-6 md:mb-0">
					<Heading2 className="m-0 p-0 text-2xl leading-6">
						All Stacks
					</Heading2>
					<Body>Peek into all active Stack groups.</Body>
				</div>
			)}
			<div className="mt-6">
				{isLoading ? <Loading /> : <CardCarousel circles={data} />}
			</div>
		</section>
	);
};

export default HomeAllStacks;
