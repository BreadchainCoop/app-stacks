"use client";

import { useState } from "react";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  GoalChip,
  savingGoalOptions,
} from "@/components/saving-goals/goal-picker";
import LocalButton from "@/components/button";
import OutlinedButton from "@/components/outlined-button";
import { usePrivy } from "@privy-io/react-auth";

const SavingGoalsStep = ({ nextStage }: { nextStage: () => void }) => {
  const { user } = usePrivy();
  const [selected, setSelected] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleGoal = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const saveAndContinue = async () => {
    if (selected.length === 0 || !user?.id) {
      nextStage();
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privyUserId: user.id, goals: selected }),
      });
    } catch (err) {
      console.error("Failed to save savings goals:", err);
    } finally {
      setSubmitting(false);
      nextStage();
    }
  };

  return (
    <section>
      <div className="card-shadow-border card-shadow-bg flex flex-col p-6 max-w-155 mx-auto">
        <div className="mb-3 flex items-center justify-end">
          <OutlinedButton bold onClick={nextStage}>
            Skip this
          </OutlinedButton>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1 text-center">
            <Heading3 className="text-2xl leading-[100%]">
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

          <LocalButton
            onClick={saveAndContinue}
            disabled={selected.length === 0 || submitting}
            className="font-bold"
          >
            {submitting ? "Saving..." : "Continue"}
          </LocalButton>
        </div>
      </div>
    </section>
  );
};

export default SavingGoalsStep;
