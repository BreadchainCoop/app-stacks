"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import StackFormContainer from "../form/form-container";
import TypePicker from "./type-picker";

type Stage = "pick" | "tutorial" | "form";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<Stage>("pick");

  const nextStage = () => setStage("form");

  if (stage === "pick") {
    return (
      <>
        <BackPage href="/" label="Return to dashboard" />
        <TypePicker onSelectRosca={() => setStage("tutorial")} />
      </>
    );
  }

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
