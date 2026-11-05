"use client";

import { useState } from "react";
import { useModal } from "../modal/context";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowsClockwiseIcon,
  HandCoinsIcon,
  IdentificationBadgeIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react";
import { ModalContainer } from "../modal/components";
import { Body, Heading3, useConnectedUser } from "@breadcoop/ui";
import LocalButton from "../button";
import LoginButton from "../login-button";

// What Stacks is, shown once per visitor before they sign up. Each stack type
// has its own tutorial when someone starts creating one.
const steps = [
  {
    icon: UsersThreeIcon,
    title: "Save and share money with people you trust",
    boldText:
      "Stacks helps groups save together, with no bank or credit check.",
    regularText: "Everything runs on open, transparent rules everyone can see.",
  },
  {
    icon: ArrowsClockwiseIcon,
    title: "Take turns or work toward a goal",
    boldText:
      "In a rotating stack, everyone pays in and each member takes a turn receiving the whole pot. In a shared goal, the group saves toward one target.",
    regularText: "If a goal isn't reached, everyone gets their money back.",
  },
  {
    icon: HandCoinsIcon,
    title: "Back someone with a conditional grant",
    boldText:
      "Give someone an advance with no interest. When they pay it back, they also receive a grant.",
    regularText:
      "A fair way to support a person or project and reward follow-through.",
  },
  {
    icon: IdentificationBadgeIcon,
    title: "Pick a username and start",
    boldText:
      "Your username is how people find you, so they can invite you or send you a grant.",
    regularText:
      "You can look around first. You'll need an account to create or join a stack.",
  },
];

export default function VisitorOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const isLast = currentStep === steps.length - 1;
  // In MiniPay the account already exists, so there's nothing to sign in to
  const signedIn = user.status === "CONNECTED";

  const close = () => setModal(null);

  const step = steps[currentStep];

  return (
    <ModalContainer className="max-w-155">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-6 items-center justify-center">
          <div className="flex flex-col gap-3 w-full">
            {/* Back on every card after the first; Skip until the last card,
                which has its own "Look around first" */}
            <div className="flex items-center justify-between min-h-6">
              {currentStep > 0 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center gap-1 text-body-bold text-primary-blue"
                >
                  <ArrowLeftIcon size={20} />
                  Back
                </button>
              ) : (
                <span />
              )}
              {!isLast && (
                <button
                  type="button"
                  onClick={close}
                  className="text-body-bold text-primary-blue"
                >
                  Skip
                </button>
              )}
            </div>
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

        {isLast ? (
          <div className="flex flex-col gap-3 w-full">
            {signedIn ? (
              <LocalButton className="font-bold w-full" onClick={close}>
                Get started
              </LocalButton>
            ) : (
              <>
                <LoginButton app="stacks" status={user.status} />
                <LocalButton
                  variant="secondary"
                  className="font-bold w-full"
                  onClick={close}
                >
                  Look around first
                </LocalButton>
              </>
            )}
          </div>
        ) : (
          <div className="flex justify-center w-full">
            <LocalButton
              className="font-bold"
              rightIcon={<ArrowRightIcon size={24} />}
              onClick={() => setCurrentStep(currentStep + 1)}
            >
              Next
            </LocalButton>
          </div>
        )}
      </div>
    </ModalContainer>
  );
}
