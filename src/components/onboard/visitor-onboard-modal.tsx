"use client";

import { useState } from "react";
import { useModal } from "../modal/context";
import {
  IdentificationBadgeIcon,
  CoinsIcon,
  UsersThreeIcon,
  ShareNetworkIcon,
  RocketLaunchIcon,
  HandCoinsIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import { ModalContainer } from "../modal/components";
import { Body, Heading3 } from "@breadcoop/ui";
import LocalButton from "../button";
import { DEPOSIT_TOKEN } from "@/lib/deposit-token";
import { getDefaultChainId } from "@/utils/chain";
import { isCeloChain } from "@/utils/celo";

// The xDAI/bake mechanic is Gnosis-only; on Celo funding is a plain
// deposit-token transfer.
const isCelo = isCeloChain(getDefaultChainId());

const steps = [
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
    boldText: isCelo
      ? `You can fund your wallet by sending ${DEPOSIT_TOKEN.symbol} from another wallet.`
      : "You can fund your wallet by sending BREAD or xDAI from your wallet.",
    regularText: isCelo
      ? "Just click on Fund your wallet button on the menu bar wallet section."
      : "Or you can buy xDAI from other distributors. Just click on Fund your wallet button on the menu bar wallet section.",
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

  const step = steps[currentStep];

  return (
    <ModalContainer className="max-w-155">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="flex flex-col gap-3 items-end w-full">
            <button
              type="button"
              onClick={() => setModal(null)}
              className="text-body-bold text-primary-blue"
            >
              Skip onboarding
            </button>
            <div className="flex flex-col gap-3 items-center w-full">
              <step.icon size={48} className="text-primary-blue" />
              <Heading3 className="text-2xl leading-6 text-center text-surface-ink tracking-tight">
                {step.title}
              </Heading3>
            </div>
          </div>

          <div className="flex flex-col gap-6 items-center justify-center text-center w-full">
            <Body bold className="text-surface-grey-2">
              {step.boldText}
            </Body>
            <Body className="text-surface-grey">{step.regularText}</Body>
          </div>

          <div className="flex gap-1.5 items-center">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-sm ${
                  i <= currentStep
                    ? "w-10 bg-primary-blue"
                    : "w-6 bg-surface-grey"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-start justify-between w-full">
          {currentStep > 0 && (
            <LocalButton
              variant="secondary"
              className="font-bold"
              onClick={handleBack}
            >
              Back
            </LocalButton>
          )}
          <LocalButton
            className={`font-bold ${currentStep === 0 ? "mx-auto" : ""}`}
            rightIcon={<ArrowRightIcon size={24} />}
            onClick={handleNext}
          >
            {currentStep === steps.length - 1 ? "Close" : "Next"}
          </LocalButton>
        </div>
      </div>
    </ModalContainer>
  );
}
