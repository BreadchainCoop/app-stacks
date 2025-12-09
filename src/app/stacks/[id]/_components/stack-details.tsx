import { Body, Heading3, Logo } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react/ssr";
import { ReactNode } from "react";

const StackDetailsTotal = () => {
	return (
		<div className="flex flex-col gap-6 mb-3 md:mb-0 md:flex-1 md:justify-end">
			<p className="flex items-baseline justify-start flex-nowrap">
				<span className="text-h1 text-[5rem] leading-[-3%]">500</span>
				<span className="text-h2 text-5xl leading-[-2%] text-surface-grey-2">
					.56
				</span>
			</p>
			<div className="flex flex-col items-end -mt-6">
				<Logo
					variant="square"
					text="BREAD"
					className="[&+span]:font-normal"
					size={24}
				/>
				<Body className="text-surface-grey-2">
					Total stacked per month
				</Body>
			</div>
			<div className="flex flex-wrap gap-4 flex-row items-center justify-between">
				<Body className="shrink-0 text-surface-grey-2">
					Total stacked by group
				</Body>
				<div className="shrink-0 flex items-center justify-start flex-wrap gap-2">
					<Logo variant="square" text="0.00" size={24} />
					<Body className="mt-[0.2rem]">BREAD</Body>
				</div>
			</div>
		</div>
	);
};

const StackDetailsBreakdownRow = ({
	label,
	children,
}: {
	children: ReactNode;
	label: string;
}) => {
	return (
		<div className="bg-paper-1 py-2 px-4 flex flex-col gap-2.5 mb-2 last:mb-0 md:flex-row md:justify-between">
			<Body className="text-surface-grey-2">{label}</Body>
			<div className="flex items-center gap-2">{children}</div>
		</div>
	);
};

const StackDetailsBreakdown = () => {
	return (
		<div className="md:flex-1">
			<StackDetailsBreakdownRow label="Monthly deposit">
				<>
					<Logo size={24} text="1000" variant="square" />
					<Body>BREAD</Body>
				</>
			</StackDetailsBreakdownRow>
			<StackDetailsBreakdownRow label="Total deposit rounds completed">
				<>
					<p className="text-h2 leading-6 tracking-[-2%] text-2xl">
						0
					</p>
					<p className="text-h3 leading-[100%] text-2xl text-surface-grey">
						out of 7
					</p>
				</>
			</StackDetailsBreakdownRow>
			<StackDetailsBreakdownRow label="Members deposit every">
				<>
					<CalendarDotsIcon size={24} className="fill-blue-2" />
					<p className="text-h2 text-2xl leading-6 tracking-[-2%]">
						30
					</p>
					<p>Days</p>
				</>
			</StackDetailsBreakdownRow>
			<StackDetailsBreakdownRow label="Time left">
				<>
					<p className="text-h2 leading-6 tracking-[-2%] text-2xl">
						10
					</p>
					<p>Months</p>
				</>
			</StackDetailsBreakdownRow>
		</div>
	);
};

const StackDetails = () => {
	return (
		<section className="bg-paper-0 flex flex-col gap-6 p-4">
			<header className="flex flex-col gap-4 border-b border-paper-2 pb-4 md:flex-row md:justify-between">
				<Heading3 className="text-2xl">Stacks details</Heading3>
				<div className="flex items-center justify-between">
					<div>
						<Body className="text-xs">
							<span className="text-surface-grey inline-block mr-1">
								ID:
							</span>
							<span className="text-surface-ink">bf-001</span>
						</Body>
					</div>
					<div className="flex items-center justify-center gap-2">
						<Body className="text-xs text-surface-grey">
							Created on:
						</Body>
						<div className="flex items-center justify-center">
							<CalendarDotsIcon
								size={16}
								className="fill-blue-2 mr-2"
							/>
							<Body className="text-surface-ink text-xs">
								31/12/2023
							</Body>
						</div>
					</div>
				</div>
			</header>
			<div className="md:flex md:justify-between md:gap-3">
				<StackDetailsTotal />
				<StackDetailsBreakdown />
			</div>
		</section>
	);
};

export default StackDetails;
