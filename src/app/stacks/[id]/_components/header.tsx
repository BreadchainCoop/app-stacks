import Alert from "@/components/alert";
import { Chip, Heading2 } from "@breadcoop/ui";

const StackHeader = () => {
	return (
		<header className="mb-3.5 md:mb-6">
			<div className="flex flex-col flex-wrap gap-4 mb-[1.3125rem] sm:flex-row sm:items-center sm:justify-between md:mb-[1.8125rem]">
				<Heading2 className="text-primary-blue text-2xl md:text-5xl">
					Summer trip 2026
				</Heading2>
				<Chip className="border-system-green text-system-green bg-paper-main max-w-max">
					Member
				</Chip>
			</div>
			<Alert
				variant="warning"
				title="IMPORTANT: Missing a deposit retires your Stacks group"
				description="If any member misses a deposit the Stacks discontinues and
					all funds deposited in that round are returned back to other
					members"
			/>
		</header>
	);
};

export default StackHeader;
