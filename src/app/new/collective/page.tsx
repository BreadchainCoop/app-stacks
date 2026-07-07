import { generateMetadata } from "@/utils/metadata";
import { FeatureGate } from "@/components/feature-gate";
import BackPage from "@/components/back-page";
import CollectiveFormContainer from "./_components/form-container";

export const metadata = generateMetadata({
  title: "Create New Collective Fund - Bread Cooperative",
  description: "Pool money as a community and vote on how to spend it.",
  url: "/new/collective",
});

export default function Page() {
  return (
    <FeatureGate feature="collectiveFund">
      <BackPage href="/" label="Cancel & Return home" className="md:hidden" />
      <CollectiveFormContainer />
    </FeatureGate>
  );
}
