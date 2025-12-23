"use client";

import HomeAllStacks from "./all-stacks";
import HomeHeader from "./header";
import HomeLoggedInDetails from "./logged-in-details";

export const HomeContent = () => {
	return (
		<div>
			<HomeHeader />
			{/* <HomeLoggedInDetails /> */}
			<HomeAllStacks />
		</div>
	);
};
