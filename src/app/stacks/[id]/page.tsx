import BackPage from "@/components/back-page";
import { Chip, Heading2 } from "@breadcoop/ui";
import TotalStacked from "./_components/total-stacked";
import DepositStatus from "./_components/deposit-status";
import Alert from "@/components/alert";
import StackDetails from "./_components/stack-details";
import StackMembers from "./_components/members";
import StackInfo from "./_components/info";
import StackHeader from "./_components/header";

const Page = () => {
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

export default Page;
