"use client";

import BackPage from "@/components/back-page";
import React from "react";
import StackHeader from "./header";
import TotalStacked from "./total-stacked";
import DepositStatus from "./deposit-status";
import StackDetails from "./stack-details";
import StackMembers from "./members";
import StackInfo from "./info";

const PageContent = () => {
	return (
		<>
			<BackPage
				label="Cancel & Return home"
				href="/"
				className="md:hidden"
			/>
			<StackHeader />
			<div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
				<div className="md:flex md:justify-between md:gap-6">
					<TotalStacked />
					<DepositStatus />
				</div>
				<StackDetails />
				<StackMembers />
				<StackInfo />
			</div>
		</>
	);
};

export default PageContent;
