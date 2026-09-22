import { Suspense } from "react";
import { generateMetadata } from "@/utils/metadata";
import OnboardingStacksCreation from "../_components/onboarding";

export const metadata = generateMetadata({
  title: "Create New Stack - Bread Cooperative",
  description: "Start a new stack",
  url: "/new/rosca",
});

export default function Page() {
  return (
    <Suspense>
      <OnboardingStacksCreation />
    </Suspense>
  );
}
