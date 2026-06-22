"use client";

import LocalButton from "@/components/button";
import OutlinedButton from "@/components/outlined-button";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  ArrowClockwiseIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CoinsIcon,
  FlagBannerFoldIcon,
  HandDepositIcon,
  PaperPlaneTiltIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr";
import { useState } from "react";

const tutorials = [
  {
    Icon: CoinsIcon,
    title: "Collective savings, no banks or credit",
    body: "Everyone contributes, everyone takes turns to receive the full benefit.",
    para: "Generations-tested savings circles, now digital & automatic.",
  },
  {
    Icon: PaperPlaneTiltIcon,
    title: "What are you saving for?",
    body: "Use Bread Stacks to meet both individual & common goals.",
    para: "Big expense or small, your group decides.",
  },
  {
    Icon: FlagBannerFoldIcon,
    title: "Invite your friends",
    body: "Bread Stacks relies on your community to build savings, together.",
    para: "Share your link with those closest to you.",
  },
  {
    Icon: HandDepositIcon,
    title: "Agree on your contributions",
    body: "Choose how much and how often each member contributes.",
    para: "Every payment moves your group closer to the goal.",
    className: "rotate-180",
  },
  {
    Icon: ArrowClockwiseIcon,
    title: "Receive your payout",
    body: "Take it in turns to receive the full amount.",
    para: "If someone misses a payment, every member is refunded in full.",
  },
];

const totalTutorials = tutorials.length;
const lastTutorialIndex = totalTutorials - 1;

const indicators = Array.from({ length: totalTutorials }, (_, i) => i);

const OnboardingTutorials = ({ nextStage }: { nextStage: () => void }) => {
  const [current, setCurrent] = useState(0);

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
        <Body className="text-surface-grey text-sm">{tutorial.para}</Body>
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
