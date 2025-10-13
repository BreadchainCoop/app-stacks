"use client";

import { LiftedButton, Body, Heading3, Caption, Heading4 } from "@breadcoop/ui";
import { Coins } from "@phosphor-icons/react/ssr";
import { useState } from "react";

interface TutorialCardProps {
  onSkip?: () => void;
  onBack?: () => void;
  onNext?: () => void;
  currentStep?: number;
  totalSteps?: number;
}

export function TutorialCard({
  onSkip,
  onBack,
  onNext,
  currentStep = 1,
  totalSteps = 5,
}: TutorialCardProps) {
  return (
    <div className="m-auto md:w-[616px] mb-20 bg-paper-0 rounded-sm p-8 shadow-lg flex justify-center items-center min-h-[60vh]">
      <div className="relative w-full max-w-lg mx-auto">
        {/* Skip tutorial link */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onSkip}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Skip tutorial
          </button>
        </div>

        {/* Main card */}
        <div className="">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Coins size={32} className="text-blue-600" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-4">
            <Heading4 className="">
              A way to reach money goals, together.
            </Heading4>
          </div>

          {/* Body text */}
          <div className="text-center mb-4">
            <Body className="text-gray-700">
              Stacks is a on-chain saving circle/ROSCA app helping people come
              together to save money and help each other financially.
            </Body>
          </div>

          {/* Caption/Note */}
          <div className="text-center mb-8">
            <Caption className="text-gray-500">Caption/Note</Caption>
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2 mb-8">
            {Array.from({ length: totalSteps }, (_, index) => (
              <div
                key={index}
                className={`h-1 w-8 rounded-full ${
                  index < currentStep ? "bg-blue-600" : "bg-blue-200"
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <LiftedButton
              preset="secondary"
              onClick={onBack}
              className="px-6 py-2"
            >
              Back
            </LiftedButton>
            <LiftedButton
              preset="primary"
              onClick={onNext}
              className="px-6 py-2"
            >
              Next
            </LiftedButton>
          </div>
        </div>
      </div>
    </div>
  );
}
