import Alert from "@/components/alert";
import { Body, Heading3 } from "@breadcoop/ui";
import { CalendarDotsIcon, CalendarStarIcon } from "@phosphor-icons/react/ssr";
import DepositStatusButton from "./deposit-status-button";

const DepositStatus = () => {
	return (
		<section className="bg-paper-0 p-5 mb-4 *:mb-4 md:mb-0 md:order-1 md:flex-2 md:max-w-[39.9375rem]">
			<header className="flex items-center justify-between border-b border-paper-2 pb-4">
				<Heading3 className="text-2xl">Deposit Status</Heading3>
				<div className="flex items-center justify-center gap-1">
					<Body className="text-xs text-surface-grey">
						Last deposit:
					</Body>
					<div>
						<CalendarDotsIcon size={16} className="fill-blue-2" />
					</div>
				</div>
			</header>
			<div>
				<div className="flex items-center justify-start gap-0.5">
					<CalendarStarIcon size={24} className="fill-blue-2" />
					<Body>Days left untill next deposit</Body>
				</div>
				<p className="text-h2 text-2xl lg:-mb-6">- days</p>
			</div>
			<div className="w-full h-4 bg-paper-2" />
			<Alert
				variant="success"
				title="Ready to start stacking"
				description="All members have accepted their invite. You can now start the Stacks group"
			/>
			<DepositStatusButton />
		</section>
	);
};

export default DepositStatus;
