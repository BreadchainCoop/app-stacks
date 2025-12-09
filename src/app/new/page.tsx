import { generateMetadata } from "@/utils/metadata";
import OnboardingStacksCreation from "./_components/onboarding";

export const metadata = generateMetadata({
	title: "Create New Stack - Bread Cooperative",
	description: "Start a new stack",
	url: "/new",
});

export default function Page() {
	return (
		<div>
			<OnboardingStacksCreation />
		</div>
	);
}
