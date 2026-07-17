"use client";

import OnboardingTutorials from "./tutorials";
import SavingGoalsStep from "./saving-goals-step";
import { useState } from "react";
import BackPage from "@/components/back-page";
import StackFormContainer from "../form/form-container";

type Stage = "tutorial" | "goals" | "form";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<Stage>("tutorial");

  return (
    <>
      {stage === "tutorial" && (
        <>
          <BackPage href="/" label="Return to dashboard" />
          <OnboardingTutorials nextStage={() => setStage("goals")} />
        </>
      )}
      {stage === "goals" && (
        <>
          <BackPage href="/" label="Return to dashboard" />
          <SavingGoalsStep nextStage={() => setStage("form")} />
        </>
      )}
      {stage === "form" && (
        <>
          <BackPage
            href="/"
            label="Cancel & Return home"
            className="md:hidden"
          />
          <StackFormContainer />
        </>
      )}
    </>
  );
};

export default OnboardingStacksCreation;
