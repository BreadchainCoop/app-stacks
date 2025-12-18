"use client";

import { Body, Heading2 } from "@breadcoop/ui";
import HomeAllStacks from "./all-stacks";
import HomeHeader from "./header";
import HomeTab from "./tab";

export const HomeContent = () => {
	return (
		<div>
			<HomeHeader />
			<HomeTab />
			<HomeAllStacks />
			<section className="mt-6">
				<div className="flex flex-col gap-6 mb-6 md:mb-0">
					<Heading2 className="m-0 p-0 text-2xl leading-6">
						All Stacks
					</Heading2>
					<Body>Peek into all active Stack groups.</Body>
				</div>
				<HomeAllStacks />
			</section>
		</div>
	);
};
