"use client";

import React, { useEffect, useState } from "react";
import { AscaCreationInitModalState } from "../context";
import { ModalContainer, ModalStatus } from "../components";
import { Body, Heading3 } from "@breadcoop/ui";
import { CheckCircleIcon, CircleIcon } from "@phosphor-icons/react/ssr";
import { cn } from "../../../lib/utils";

const getIcon = (index: number, currentStep: number) => {
  if (index < currentStep) {
    return (
      <CheckCircleIcon className="w-6 h-6 stroke-primary-blue fill-primary-blue" />
    );
  }
  if (index === currentStep) {
    return <CircleIcon className="w-6 h-6 text-gray-500" />;
  }
  return <CircleIcon className="w-6 h-6 rounded-full fill-primary-blue" />;
};

const steps = [
  "Validating fund parameters...",
  "Setting up smart contract...",
  "Initializing member registry...",
  "Configuring credit lines...",
  "Finalizing fund creation...",
];

const AscaInitModal = ({
  modalState,
}: {
  modalState: AscaCreationInitModalState;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (modalState.status === "awaiting") return;

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (!(prev < steps.length)) {
          clearInterval(interval);

          return prev;
        }

        // We finalize the last check list when creating the fund succeeds
        if (prev === steps.length - 1 && modalState.status !== "successful") {
          return prev;
        }

        return prev + 1;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [modalState.status]);

  return (
    <ModalContainer>
      <ModalStatus status="loading" showLoadingMsg={false} />
      <div className="text-center">
        <Heading3 className="text-2xl mb-3">
          Creating your savings & credit fund
        </Heading3>
        <Body className="text-surface-grey-2 mb-6">
          Please wait while we set up your fund..
        </Body>
        <div className="bg-paper-2 p-4 border-l-4 border-blue-1 text-left">
          <Body bold className="flex items-center justify-start gap-2">
            <span>Fund:</span>
            <span className="font-normal">{modalState.name}</span>
          </Body>
        </div>
      </div>
      <div className="w-full space-y-4 px-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className={`flex items-center justify-start space-x-2 transition-all duration-500 ease-in-out ${
              index < currentStep
                ? "opacity-100 translate-x-0"
                : index === currentStep
                  ? "opacity-100 translate-x-0"
                  : "opacity-50"
            }`}
          >
            {getIcon(index, currentStep)}
            <Body
              className={cn(
                "text-sm transition-colors duration-500",
                index > currentStep
                  ? "text-surface-grey"
                  : "text-surface-grey-2"
              )}
            >
              {step}
            </Body>
          </div>
        ))}
      </div>
    </ModalContainer>
  );
};

export default AscaInitModal;
