"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import { FeatureGate } from "@/components/feature-gate";
import StackFormContainer from "../form/form-container";
import TypePicker from "./type-picker";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<"tutorial" | "form">("tutorial");
  const [pickedRosca, setPickedRosca] = useState(false);

  const nextStage = () => setStage("form");

  const roscaFlow =
    stage === "tutorial" ? (
      <>
        <BackPage href="/" label="Return to dashboard" />
        <OnboardingTutorials nextStage={nextStage} />
      </>
    ) : (
      <>
        <BackPage href="/" label="Cancel & Return home" className="md:hidden" />

        <StackFormContainer />
      </>
    );

  // With Goal savings hidden, /new goes straight to the ROSCA tutorial.
  return (
    <FeatureGate feature="goalSavings" fallback={roscaFlow}>
      {pickedRosca ? (
        roscaFlow
      ) : (
        <>
          <BackPage href="/" label="Return to dashboard" />
          <TypePicker onSelectRosca={() => setPickedRosca(true)} />
        </>
      )}
    </FeatureGate>
  );
};

export default OnboardingStacksCreation;
