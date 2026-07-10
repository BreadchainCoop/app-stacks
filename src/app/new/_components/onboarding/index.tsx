"use client";

import OnboardingTutorials from "./tutorials";
import { useState } from "react";
import BackPage from "@/components/back-page";
import StackFormContainer from "../form/form-container";
import { useIsMiniPay } from "@/hooks/use-is-minipay";
import { Body, Heading3 } from "@breadcoop/ui";

const OnboardingStacksCreation = () => {
  const [stage, setStage] = useState<"tutorial" | "form">("tutorial");
  const isMiniPay = useIsMiniPay();

  const nextStage = () => setStage("form");

  // Invite links are signed by the creator with EIP-712, and MiniPay has no
  // message signing — a Stack created here could never invite anyone, so
  // creation is gated until an unsigned invite flow exists.
  if (isMiniPay) {
    return (
      <>
        <BackPage href="/" label="Return to dashboard" />
        <section className="flex flex-col gap-4 border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26]">
          <Heading3 className="text-2xl">
            Creating a Stack isn&apos;t available in MiniPay yet
          </Heading3>
          <Body>
            Stacks are created on the web app for now. You can join a Stack by
            opening an invite link from its creator.
          </Body>
        </section>
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
