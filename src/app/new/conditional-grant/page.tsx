import { generateMetadata } from "@/utils/metadata";
import { FeatureGate } from "@/components/feature-gate";
import BackPage from "@/components/back-page";
import ConditionalGrantFormContainer from "./_components/form-container";

export const metadata = generateMetadata({
  title: "New Conditional Grant - Bread Cooperative",
  description:
    "Advance money with no interest and reward paying it back with an escrowed grant.",
  url: "/new/conditional-grant",
});

export default function Page() {
  return (
    <FeatureGate feature="conditionalGrants">
      <BackPage href="/new" label="Back to stack types" />
      <ConditionalGrantFormContainer />
    </FeatureGate>
  );
}
