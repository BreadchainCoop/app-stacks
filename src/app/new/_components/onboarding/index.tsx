"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import { FeatureGate } from "@/components/feature-gate";
import StackFormContainer from "../form/form-container";
import { useChainPath } from "@/components/providers/active-chain";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<"tutorial" | "form">("tutorial");
  const chainHref = useChainPath();

  const nextStage = () => setStage("form");

  return (
    <>
      <FeatureGate
        feature="goalSavings"
        fallback={
          stage === "tutorial" ? (
            <BackPage href={chainHref("/")} label="Return to dashboard" />
          ) : (
            <BackPage
              href={chainHref("/")}
              label="Cancel & Return home"
              className="md:hidden"
            />
          )
        }
      >
        <BackPage href={chainHref("/new")} label="Back to stack types" />
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
