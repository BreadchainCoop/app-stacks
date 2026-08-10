"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import StackFormContainer from "../form/form-container";

type Stage = "tutorial" | "form";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<Stage>("tutorial");

  return (
    <>
      {stage === "tutorial" && (
        <>
          <BackPage href="/" label="Return to dashboard" />
          <OnboardingTutorials nextStage={() => setStage("form")} />
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
