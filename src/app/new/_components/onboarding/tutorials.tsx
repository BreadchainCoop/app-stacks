"use client";

import LocalButton from "@/components/button";
import OutlinedButton from "@/components/outlined-button";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";
import { Tutorial } from "./tutorial-content";

const OnboardingTutorials = ({
  tutorials,
  nextStage,
}: {
  tutorials: Tutorial[];
  nextStage: () => void;
}) => {
  const [current, setCurrent] = useState(0);
  const lastTutorialIndex = tutorials.length - 1;
  const indicators = tutorials.map((_, i) => i);

  const tutorial = tutorials[current];

  const nextTutorial = () => {
    setCurrent((prev) => {
      if (prev >= lastTutorialIndex) return prev;

      return prev + 1;
    });
  };

  const prevTutorial = () => {
    setCurrent((prev) => {
      if (prev - 1 < 0) return prev;

      return prev - 1;
    });
  };

  return (
    <section>
      <div className="card-shadow-border card-shadow-bg flex flex-col text-center p-6 max-w-155 mx-auto">
        <div className="mb-3 flex items-center justify-between">
          {current > 0 && (
            <OutlinedButton
              bold
              className="mr-auto"
              leftIcon={<ArrowLeftIcon className="size-6" />}
              onClick={prevTutorial}
            >
              Back
            </OutlinedButton>
          )}
          <OutlinedButton bold className="ml-auto" onClick={nextStage}>
            Skip Tutorial
          </OutlinedButton>
        </div>
        <figure className="max-w-max mx-auto text-primary-blue mb-3">
          {<tutorial.Icon className={`size-12 ${tutorial.className || ""}`} />}
        </figure>
        <Heading3 className="mb-6 text-2xl leading-[100%]">
          {tutorial.title}
        </Heading3>
        <Body className="mb-3 text-surface-grey-2">{tutorial.body}</Body>
        {tutorial.para && (
          <Body className="text-surface-grey text-sm">{tutorial.para}</Body>
        )}
        <div className="flex items-center justify-center gap-2 my-6">
          {indicators.map((id) => (
            <div
              key={id}
              className={`w-10 h-1 transition-colors ${
                id === current ? "bg-blue-2" : "bg-blue-0"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-between">
          {/* TODO: Match UI with design */}
          {current > 0 && (
            <LocalButton
              className="font-bold hidden md:block"
              variant="secondary"
              onClick={prevTutorial}
            >
              Back
            </LocalButton>
          )}
          <div
            className={`mx-auto ${current === 0 ? "md:mx-auto" : "md:mx-0"}`}
          >
            <LocalButton
              className="font-bold"
              onClick={current === lastTutorialIndex ? nextStage : nextTutorial}
              leftIcon={
                current === lastTutorialIndex ? <SparkleIcon /> : undefined
              }
              rightIcon={
                current < lastTutorialIndex ? (
                  <ArrowRightIcon className="size-6" />
                ) : undefined
              }
            >
              {current === lastTutorialIndex ? "Start" : "Next"}
            </LocalButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingTutorials;
