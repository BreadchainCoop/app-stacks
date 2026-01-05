"use client";

import BackPage from "@/components/back-page";
import React from "react";
import StackHeader from "./header";
import StackDetails from "./stack-details";
import StackMembers from "./members";
import StackInfo from "./info";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { useCircleInfo } from "@/hooks/use-circle-info";
import { Body } from "@breadcoop/ui";
import StackedStatus from "./stacked-status";

const PageContent = ({ id }: { id: string }) => {
	const circleInfo = useCircleInfo(BigInt(id));

	return (
		<>
			<BackPage
				label="Cancel & Return home"
				href="/"
				className="md:hidden"
			/>
			<StackHeader id={id} />
			{circleInfo.circle ? (
				<>
					<div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
						<StackedStatus id={id} circle={circleInfo.circle} />
						<StackDetails id={id} circle={circleInfo.circle} />
						<StackMembers id={id} owner={circleInfo.circle.owner} />
						<StackInfo owner={circleInfo.circle.owner} />
					</div>
				</>
			) : circleInfo.error ? (
				// TODO: Show correct error message
				<Body className="text-system-red">
					Unable to get circle data!
				</Body>
			) : (
				<div className="flex items-center justify-center">
					<CircularProgressIcon />
				</div>
			)}
		</>
	);
};

export default PageContent;
