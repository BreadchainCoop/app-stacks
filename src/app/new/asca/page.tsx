import { generateMetadata } from "@/utils/metadata";
import { FeatureGate } from "@/components/feature-gate";
import BackPage from "@/components/back-page";
import AscaFormContainer from "./_components/form-container";

export const metadata = generateMetadata({
  title: "Create New Fund - Bread Cooperative",
  description: "Start a savings & credit fund with your friends.",
  url: "/new/asca",
});

export default function Page() {
  return (
    <FeatureGate feature="asca">
      <BackPage href="/" label="Cancel & Return home" className="md:hidden" />
      <AscaFormContainer />
    </FeatureGate>
  );
}
