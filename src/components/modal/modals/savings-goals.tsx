"use client";

import { useState } from "react";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  HouseIcon,
  ShieldCheckIcon,
  CurrencyCircleDollarIcon,
  TrendUpIcon,
  GraduationCapIcon,
  StorefrontIcon,
  AirplaneTiltIcon,
  SparkleIcon,
  UsersThreeIcon,
  Icon,
} from "@phosphor-icons/react";
import LocalButton from "@/components/button";
import { ModalContainer } from "../components";
import { SavingsGoalsModalState, useModal } from "../context";
import clsx from "clsx";

type SavingGoal = {
  id: string;
  label: string;
  description: string;
  icon: Icon;
};

const savingGoals: SavingGoal[] = [
  {
    id: "home",
    label: "Buy a Home",
    description: "Save for a down payment",
    icon: HouseIcon,
  },
  {
    id: "emergency",
    label: "Emergency Fund",
    description: "Build a safety net",
    icon: ShieldCheckIcon,
  },
  {
    id: "debt",
    label: "Pay Off Debt",
    description: "Student loans, credit cards, etc.",
    icon: CurrencyCircleDollarIcon,
  },
  {
    id: "retirement",
    label: "Retirement",
    description: "Long-term wealth building",
    icon: TrendUpIcon,
  },
  {
    id: "education",
    label: "Education",
    description: "Tuition, courses, certifications",
    icon: GraduationCapIcon,
  },
  {
    id: "business",
    label: "Start a Business",
    description: "Entrepreneurship fund",
    icon: StorefrontIcon,
  },
  {
    id: "travel",
    label: "Travel",
    description: "Vacation or trip savings",
    icon: AirplaneTiltIcon,
  },
  {
    id: "other",
    label: "Something Else",
    description: "Custom savings goal",
    icon: SparkleIcon,
  },
];

const amountOptions = [
  "Under $1K",
  "$1K–$5K",
  "$5K–$10K",
  "$10K–$25K",
  "$25K–$50K",
  "$50K+",
];

const timelineOptions = [
  "3 months",
  "6 months",
  "1 year",
  "2 years",
  "3+ years",
  "No rush",
];

const monthlyOptions = [
  "Under $50",
  "$50–$100",
  "$100–$250",
  "$250–$500",
  "$500–$1K",
  "$1K+",
];

type Responses = {
  goals: string[];
  amount: string | null;
  timeline: string | null;
  monthly: string | null;
};

function GoalCard({
  goal,
  selected,
  onToggle,
}: {
  goal: SavingGoal;
  selected: boolean;
  onToggle: () => void;
}) {
  const IconComp = goal.icon;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "flex items-center gap-3 border p-3 text-left transition-colors",
        selected
          ? "border-primary-blue bg-blue-0/10"
          : "border-paper-1 bg-paper-0 hover:border-surface-grey"
      )}
    >
      <IconComp
        size={24}
        weight={selected ? "fill" : "regular"}
        className={selected ? "text-primary-blue" : "text-surface-grey-2"}
      />
      <div>
        <Body bold className="text-sm">
          {goal.label}
        </Body>
        <Body className="text-xs text-surface-grey">{goal.description}</Body>
      </div>
    </button>
  );
}

function ChipSelect({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onSelect(option)}
          className={clsx(
            "border px-4 py-2 text-sm font-bold transition-colors",
            selected === option
              ? "border-primary-blue bg-primary-blue text-paper-0"
              : "border-paper-1 bg-paper-main text-surface-grey-2 hover:border-surface-grey"
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

const TOTAL_STEPS = 4;

export default function SavingsGoalsModal({
  modalState,
}: {
  modalState: SavingsGoalsModalState;
}) {
  const { setModal } = useModal();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState<Responses>({
    goals: [],
    amount: null,
    timeline: null,
    monthly: null,
  });
  const [submitting, setSubmitting] = useState(false);

  const toggleGoal = (id: string) => {
    setResponses((prev) => ({
      ...prev,
      goals: prev.goals.includes(id)
        ? prev.goals.filter((g) => g !== id)
        : [...prev.goals, id],
    }));
  };

  const submitResponses = async (partial: boolean) => {
    if (!modalState.privyUserId) return;
    setSubmitting(true);
    try {
      await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyUserId: modalState.privyUserId,
          responses,
          partial,
        }),
      });
    } catch (err) {
      console.error("Failed to save savings goals:", err);
    } finally {
      setSubmitting(false);
      if (modalState.showFundingNext) {
        setModal({ type: "NEW_USER_ONBOARDING", fundingStatus: "idle" });
      } else {
        setModal(null);
      }
    }
  };

  const handleContinue = () => {
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1);
    } else {
      submitResponses(false);
    }
  };

  const handleSkip = () => {
    submitResponses(true);
  };

  const canContinue =
    step === 0
      ? responses.goals.length > 0
      : step === 1
        ? !!responses.amount
        : step === 2
          ? !!responses.timeline
          : !!responses.monthly;

  return (
    <ModalContainer className="max-w-[28rem]">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary-blue/10">
            <UsersThreeIcon size={32} className="text-primary-blue" />
          </div>
          <Heading3 className="text-2xl font-black leading-7 tracking-tight text-surface-ink">
            Your Savings Goals
          </Heading3>
          <Body className="text-surface-grey">
            Tell us what you&apos;re saving for so we can match you with the
            right communities
          </Body>
        </div>

        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                "h-1 rounded-sm transition-all",
                i <= step ? "w-8 bg-primary-blue" : "w-5 bg-surface-grey/30"
              )}
            />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          {step === 0 && (
            <>
              <Body bold>What are you saving for?</Body>
              <Body className="text-xs text-surface-grey">
                Select all that apply
              </Body>
              <div className="grid grid-cols-2 gap-2">
                {savingGoals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    selected={responses.goals.includes(goal.id)}
                    onToggle={() => toggleGoal(goal.id)}
                  />
                ))}
              </div>
            </>
          )}

          {step === 1 && (
            <>
              <Body bold>How much are you looking to save?</Body>
              <ChipSelect
                options={amountOptions}
                selected={responses.amount}
                onSelect={(v) =>
                  setResponses((prev) => ({ ...prev, amount: v }))
                }
              />
            </>
          )}

          {step === 2 && (
            <>
              <Body bold>What&apos;s your timeline?</Body>
              <ChipSelect
                options={timelineOptions}
                selected={responses.timeline}
                onSelect={(v) =>
                  setResponses((prev) => ({ ...prev, timeline: v }))
                }
              />
            </>
          )}

          {step === 3 && (
            <>
              <Body bold>How much can you save per month?</Body>
              <ChipSelect
                options={monthlyOptions}
                selected={responses.monthly}
                onSelect={(v) =>
                  setResponses((prev) => ({ ...prev, monthly: v }))
                }
              />
            </>
          )}
        </div>

        <div className="flex flex-col items-center gap-3">
          <LocalButton
            onClick={handleContinue}
            disabled={!canContinue || submitting}
            className="w-full font-bold"
          >
            {submitting ? "Saving..." : "Continue"}
          </LocalButton>
          <button
            type="button"
            onClick={handleSkip}
            disabled={submitting}
            className="text-sm text-surface-grey hover:text-surface-grey-2"
          >
            Skip for now
          </button>
        </div>
      </div>
    </ModalContainer>
  );
}
