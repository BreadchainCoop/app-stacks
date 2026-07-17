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
  Icon,
} from "@phosphor-icons/react";
import LocalButton from "@/components/button";
import clsx from "clsx";

export type SavingGoalOption = {
  id: string;
  label: string;
  description: string;
  icon: Icon;
};

export const savingGoalOptions: SavingGoalOption[] = [
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

export function GoalCard({
  goal,
  selected,
  onSelect,
}: {
  goal: SavingGoalOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const IconComp = goal.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
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

export default function SavingGoalPicker({
  onSelect,
  onSkip,
  submitting,
  initialGoal,
}: {
  onSelect: (goalId: string) => void;
  onSkip: () => void;
  submitting?: boolean;
  initialGoal?: string | null;
}) {
  const [selected, setSelected] = useState<string | null>(initialGoal ?? null);

  const handleContinue = () => {
    if (selected) onSelect(selected);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading3 className="text-2xl font-black leading-7 tracking-tight text-surface-ink">
          What are you saving for?
        </Heading3>
        <Body className="text-surface-grey">
          Tell us your goal so we can match you with the right communities
        </Body>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {savingGoalOptions.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            selected={selected === goal.id}
            onSelect={() => setSelected(goal.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <LocalButton
          onClick={handleContinue}
          disabled={!selected || submitting}
          className="w-full font-bold"
        >
          {submitting ? "Saving..." : "Continue"}
        </LocalButton>
        <button
          type="button"
          onClick={onSkip}
          disabled={submitting}
          className="text-sm text-surface-grey hover:text-surface-grey-2"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
