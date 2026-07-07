"use client";

import { useState } from "react";
import { useModal } from "../context";
import OnboardingCard, { type OnboardingStep } from "./onboarding-card";
import {
  IdentificationBadgeIcon,
  CoinsIcon,
  UsersThreeIcon,
  ShareNetworkIcon,
  RocketLaunchIcon,
  HandCoinsIcon,
} from "@phosphor-icons/react";

const steps: OnboardingStep[] = [
  {
    icon: IdentificationBadgeIcon,
    title: "Create your account in Stacks",
    boldText:
      "Click on Sign-In and use your e-mail or wallet to create your account.",
    regularText:
      "This allows you to keep everything in one place once your try to Log-In back to Stacks.",
  },
  {
    icon: CoinsIcon,
    title: "Fund your wallet",
    boldText:
      "You can fund your wallet by sending BREAD or xDAI from your wallet.",
    regularText:
      "Or you can buy xDAI from other distributors. Just click on Fund your wallet button on the menu bar wallet section.",
  },
  {
    icon: UsersThreeIcon,
    title: "Create a Stack with your friends",
    boldText:
      "Set up a savings group by choosing the amount, frequency, and number of members.",
    regularText:
      "Stacks let you pool money together with people you trust — everyone contributes, everyone takes turns.",
  },
  {
    icon: ShareNetworkIcon,
    title: "Invite friends to join your Stack",
    boldText:
      "Share your invite link — once everyone joins, the Stack is ready to launch.",
    regularText:
      "All members need to join before the Stack can start. You can share the link via any messaging app.",
  },
  {
    icon: RocketLaunchIcon,
    title: "Launch and make deposits",
    boldText:
      "When all spots are filled, start the Stack and make your first deposit.",
    regularText:
      "Each member contributes their share at the start of every round. The cycle runs automatically.",
  },
  {
    icon: HandCoinsIcon,
    title: "Claim your round",
    boldText:
      "When it's your turn, claim the full pooled amount from the group.",
    regularText:
      "Everyone gets their turn. The payout order is set when the Stack launches.",
  },
];

export default function VisitorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { setModal } = useModal();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setModal(null);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <OnboardingCard
      steps={steps}
      currentStep={currentStep}
      onNext={handleNext}
      onBack={currentStep > 0 ? handleBack : undefined}
    />
  );
}
