import { generateMetadata } from "@/utils/metadata";
import OnboardingStacksCreation from "./_components/onboarding";
import { FeatureGate } from "@/components/feature-gate";
import BackPage from "@/components/back-page";
import TypePicker from "./_components/onboarding/type-picker";
import { Suspense } from "react";

export const metadata = generateMetadata({
  title: "Create New Stack - Bread Cooperative",
  description: "Start a new stack",
  url: "/new",
});

export default function Page() {
  return (
    <div>
      <FeatureGate
        feature="goalSavings"
        fallback={<OnboardingStacksCreation />}
      >
        <BackPage href="/" label="Return to dashboard" />
        <Suspense>
          <TypePicker />
        </Suspense>
      </FeatureGate>
    </div>
  );
}
