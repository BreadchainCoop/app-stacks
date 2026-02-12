"use client";

import LocalLiftedButton from "@/components/lifted-button";
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
    title: "A simple way to reach your money goals—together.",
    body: "Stacks helps friends and family save money as a group. Everyone contributes a little, takes turns receiving the total, and supports each other financially.",
    para: "Think of it as a digital saving circle, but safer and automatic.",
  },
  {
    Icon: FlagBannerFoldIcon,
    title: "Set a goal for your group",
    body: "Decide what you’re saving for—like tuition, a trip, or a new gadget. Pick how much everyone contributes and how often.",
    para: "Each member saves the same amount toward the same goal.",
  },
  {
    Icon: PaperPlaneTiltIcon,
    title: "Invite your friends",
    body: "Share your goal with friends or family and start stacking money together. The more people you invite, the faster you reach your goal!",
    para: "You’ll get a shareable link or code to invite others.",
  },
  {
    Icon: HandDepositIcon,
    title: "Make your contributions",
    body: "Each member deposits a set amount every week or month into the group’s shared pool. Once everyone has contributed, the payout begins!",
    para: "Deposits are tracked on-chain, so everything is transparent and secure.",
    className: "rotate-180",
  },
  {
    Icon: ArrowClockwiseIcon,
    title: "Get paid out",
    body: "Each round, one group member receives the total amount stacked. Everyone takes turns until all members have received their payout.",
    para: "If someone misses a payment, all deposits are refunded to the others—so your money is always safe. No one loses money if a member doesn’t pay.",
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
            <div className="hidden md:block">
              <LocalLiftedButton
                preset="secondary"
                className="font-bold"
                onClick={prevTutorial}
              >
                Back
              </LocalLiftedButton>
            </div>
          )}
          <div
            className={`mx-auto ${current === 0 ? "md:mx-auto" : "md:mx-0"}`}
          >
            <LocalLiftedButton
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
            </LocalLiftedButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OnboardingTutorials;
