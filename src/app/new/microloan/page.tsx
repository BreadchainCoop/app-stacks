import { generateMetadata } from "@/utils/metadata";
import { FeatureGate } from "@/components/feature-gate";
import BackPage from "@/components/back-page";
import MicroloanFormContainer from "./_components/form-container";

export const metadata = generateMetadata({
  title: "New Microloan - Bread Cooperative",
  description:
    "Lend with no interest and reward repayment with an escrowed grant.",
  url: "/new/microloan",
});

export default function Page() {
  return (
    <FeatureGate feature="microloans">
      <BackPage href="/new" label="Back to stack types" />
      <MicroloanFormContainer />
    </FeatureGate>
  );
}
