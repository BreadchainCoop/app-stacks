"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import { FeatureGate } from "@/components/feature-gate";
import StackFormContainer from "../form/form-container";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<"tutorial" | "form">("tutorial");

  const nextStage = () => setStage("form");

  return (
    <>
      <FeatureGate
        feature="goalSavings"
        fallback={
          stage === "tutorial" ? (
            <BackPage href="/" label="Return to dashboard" />
          ) : (
            <BackPage
              href="/"
              label="Cancel & Return home"
              className="md:hidden"
            />
          )
        }
      >
        <BackPage href="/new" label="Back to stack types" />
      </FeatureGate>
      {stage === "tutorial" ? (
        <OnboardingTutorials nextStage={nextStage} />
      ) : (
        <StackFormContainer />
      )}
    </>
  );
};

export default OnboardingStacksCreation;
