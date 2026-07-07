"use client";

import { Body, Heading3 } from "@breadcoop/ui";
import { ArrowRightIcon, Icon } from "@phosphor-icons/react";
import LocalButton from "@/components/button";
import { ModalContainer } from "../components";
import { useModal } from "../context";

export type OnboardingStep = {
  icon: Icon;
  title: string;
  boldText: string;
  regularText: string;
};

export default function OnboardingCard({
  steps,
  currentStep,
  onNext,
  onBack,
}: {
  steps: OnboardingStep[];
  currentStep: number;
  onNext: () => void;
  onBack?: () => void;
}) {
  const { setModal } = useModal();
  const step = steps[currentStep];
  const StepIcon = step.icon;

  return (
    <ModalContainer className="max-w-[38.75rem]">
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
              <StepIcon size={48} className="text-primary-blue" />
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
          {onBack ? (
            <LocalButton
              variant="secondary"
              className="font-bold"
              onClick={onBack}
            >
              Back
            </LocalButton>
          ) : (
            <div />
          )}
          <LocalButton
            className="font-bold w-[200px]"
            rightIcon={<ArrowRightIcon size={24} />}
            onClick={onNext}
          >
            Next
          </LocalButton>
        </div>
      </div>
    </ModalContainer>
  );
}
