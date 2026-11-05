"use client";

import { useState } from "react";
import { useModal, VisitorOnboardingModalState } from "../modal/context";
import {
  SparkleIcon,
  StackIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  IdentificationBadgeIcon,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { ModalContainer } from "../modal/components";
import { Body, cn, Heading3, useConnectedUser } from "@breadcoop/ui";
import { STACK_TYPE_LABELS } from "@/lib/stack-types";
import LocalButton from "../button";
import LoginButton from "../login-button";

type Step = {
  icon: Icon;
  title: string;
  boldText: string;
  regularText?: string;
  /** A short list under the text, e.g. the kinds of stack */
  items?: { label: string; text: string }[];
};

// What Stacks is, shown once per visitor and once per new account. Each stack
// type has its own tutorial when someone starts creating one.
const steps: Step[] = [
  {
    icon: SparkleIcon,
    title: "Welcome to Stacks",
    boldText: "Stacks is a super app for collective forms of finance.",
    regularText:
      "Save and share money with people you trust, with no bank or credit check, on open rules everyone can see.",
  },
  {
    icon: StackIcon,
    title: "Start a stack",
    boldText:
      "A stack is a ready-made way to manage money together. There are three kinds:",
    items: [
      {
        label: STACK_TYPE_LABELS.rosca,
        text: "Everyone pays in each round and takes turns receiving the whole pot.",
      },
      {
        label: STACK_TYPE_LABELS.goal,
        text: "Save together toward one target. If you miss it, everyone gets their money back.",
      },
      {
        label: STACK_TYPE_LABELS.conditionalGrant,
        text: "Give someone an advance with no interest, plus a grant once they pay it back.",
      },
    ],
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

function StepContent({ step }: { step: Step }) {
  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col gap-3 items-center w-full">
        <step.icon size={48} className="text-primary-blue" />
        <Heading3 className="text-2xl leading-6 text-center text-surface-ink tracking-tight">
          {step.title}
        </Heading3>
      </div>
      <div className="flex flex-col gap-4 items-center text-center w-full">
        <Body bold className="text-surface-grey-2">
          {step.boldText}
        </Body>
        {step.items && (
          <ul className="flex flex-col gap-3 w-full text-left">
            {step.items.map((item) => (
              <li
                key={item.label}
                className="border border-paper-2 bg-paper-1 py-2 px-4"
              >
                <Body bold className="text-surface-ink">
                  {item.label}
                </Body>
                <Body className="text-sm text-surface-grey">{item.text}</Body>
              </li>
            ))}
          </ul>
        )}
        {step.regularText && (
          <Body className="text-surface-grey">{step.regularText}</Body>
        )}
      </div>
    </div>
  );
}

export default function VisitorOnboarding({
  modalState,
}: {
  modalState: VisitorOnboardingModalState;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const isLast = currentStep === steps.length - 1;
  // In MiniPay the account already exists, so there's nothing to sign in to
  const signedIn = user.status === "CONNECTED";

  // Back to whatever the intro opened over, e.g. a new account's username prompt
  const close = () => setModal(modalState.resume ?? null);

  return (
    <ModalContainer className="max-w-155">
      <div className="flex flex-col gap-6">
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

        {/* Every card shares one grid cell, so the modal takes the size of the
            largest and stays the same size from card to card */}
        <div className="grid">
          {steps.map((step, i) => (
            <div
              key={step.title}
              aria-hidden={i !== currentStep}
              className={cn(
                "col-start-1 row-start-1",
                i !== currentStep && "invisible"
              )}
            >
              <StepContent step={step} />
            </div>
          ))}
        </div>

        <div className="flex gap-1.5 items-center justify-center">
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

        {/* Tall enough for the last card's two buttons on every card */}
        <div className="flex flex-col gap-3 w-full min-h-27">
          {isLast ? (
            signedIn ? (
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
            )
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
      </div>
    </ModalContainer>
  );
}
