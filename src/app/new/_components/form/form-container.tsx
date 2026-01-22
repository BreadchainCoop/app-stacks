"use client";

import { useState } from "react";
import StackForm from "./form";
import StackOverviewForm from "./overview";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import stackSchema, { StackFormSchemaData } from "./schema";
import { Heading2 } from "@breadcoop/ui";

const StackFormContainer = ({ nextStage }: { nextStage: () => void }) => {
	const form = useForm<StackFormSchemaData>({
		resolver: zodResolver(stackSchema),
		defaultValues: {
			name: "",
			members: undefined,
			depositAmount: undefined,
			depositInterval: "weekly",
		},
	});
	const [showOverview, setShowOverview] = useState(false);

	const handleContinue = () => {
		setShowOverview(true);
	};

	const handleBack = () => {
		setShowOverview(false);
	};

	return (
		<FormProvider {...form}>
			<form>
				<header className="mb-6.25 md:mb-6">
					<Heading2 className="text-primary-blue text-[2.5rem] leading-9 md:text-5xl">
						New Stack
					</Heading2>
				</header>
				<div className="lg:flex lg:gap-6">
					{/* Form: Hidden on mobile when overview is shown */}
					<div
						className={`flex-1 ${
							showOverview ? "hidden lg:block" : ""
						}`}
					>
						<StackForm onContinue={handleContinue} />
					</div>

					{/* Overview: Hidden on mobile until Continue is clicked */}
					<div
						className={`flex-1 ${
							showOverview ? "" : "hidden lg:block"
						}`}
					>
						<StackOverviewForm onBack={handleBack} />
					</div>
				</div>
			</form>
		</FormProvider>
	);
};

export default StackFormContainer;
