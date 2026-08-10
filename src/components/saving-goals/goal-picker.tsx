"use client";

import { useState } from "react";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  AirplaneTiltIcon,
  HouseIcon,
  CurrencyCircleDollarIcon,
  FirstAidKitIcon,
  GlobeIcon,
  UsersIcon,
  Icon,
} from "@phosphor-icons/react";
import LocalButton from "@/components/button";
import clsx from "clsx";

export type SavingGoalOption = {
  id: string;
  label: string;
  icon: Icon;
};

export const savingGoalOptions: SavingGoalOption[] = [
  {
    id: "vacations",
    label: "Save for vacations",
    icon: AirplaneTiltIcon,
  },
  {
    id: "down-payment",
    label: "Put together a down payment",
    icon: HouseIcon,
  },
  {
    id: "special-event",
    label: "Fund a special event",
    icon: CurrencyCircleDollarIcon,
  },
  {
    id: "medical",
    label: "Pool money for a medical procedure",
    icon: FirstAidKitIcon,
  },
  {
    id: "remittances",
    label: "Send remittances collectively",
    icon: GlobeIcon,
  },
  {
    id: "split-bills",
    label: "Split bills with a group",
    icon: UsersIcon,
  },
];

export function GoalChip({
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
        "flex items-center gap-2 border px-4 py-2 text-left text-sm transition-colors",
        selected
          ? "border-primary-blue bg-blue-0/10 text-surface-ink"
          : "border-paper-1 bg-paper-0 text-surface-grey hover:border-surface-grey"
      )}
    >
      <IconComp
        size={18}
        weight={selected ? "fill" : "regular"}
        className={selected ? "text-primary-blue" : "text-surface-grey-2"}
      />
      {goal.label}
    </button>
  );
}

export default function SavingGoalPicker({
  onSelect,
  onSkip,
  submitting,
  initialGoals,
}: {
  onSelect: (goalIds: string[]) => void;
  onSkip: () => void;
  submitting?: boolean;
  initialGoals?: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initialGoals ?? []);

  const toggleGoal = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Heading3 className="text-2xl font-black leading-7 tracking-tight text-surface-ink">
          What are you saving for when using Stacks?
        </Heading3>
        <Body className="text-surface-grey">Select all that apply</Body>
      </div>

      <div className="flex flex-wrap gap-2">
        {savingGoalOptions.map((goal) => (
          <GoalChip
            key={goal.id}
            goal={goal}
            selected={selected.includes(goal.id)}
            onSelect={() => toggleGoal(goal.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <LocalButton
          onClick={() => onSelect(selected)}
          disabled={selected.length === 0 || submitting}
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
