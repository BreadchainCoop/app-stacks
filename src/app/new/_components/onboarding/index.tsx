"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import StackFormContainer from "../form/form-container";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<"tutorial" | "form">("tutorial");

  const nextStage = () => setStage("form");

  return (
    <>
      {stage === "tutorial" ? (
        <>
          <BackPage href="/" label="Return to dashboard" />
          <OnboardingTutorials nextStage={nextStage} />
        </>
      ) : (
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
