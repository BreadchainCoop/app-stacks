import { generateMetadata } from "@/utils/metadata";
import { FeatureGate } from "@/components/feature-gate";
import BackPage from "@/components/back-page";
import GoalFormContainer from "./_components/form-container";

export const metadata = generateMetadata({
  title: "Create New Goal - Bread Cooperative",
  description: "Save together toward a target by a deadline.",
  url: "/new/goal",
});

export default function Page() {
  return (
    <FeatureGate feature="goalSavings">
      <BackPage href="/" label="Cancel & Return home" className="md:hidden" />
      <GoalFormContainer />
    </FeatureGate>
  );
}
