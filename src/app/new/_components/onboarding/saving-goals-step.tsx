"use client";

import { useState } from "react";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  GoalCard,
  savingGoalOptions,
} from "@/components/saving-goals/goal-picker";
import LocalButton from "@/components/button";
import OutlinedButton from "@/components/outlined-button";
import { usePrivy } from "@privy-io/react-auth";

const SavingGoalsStep = ({ nextStage }: { nextStage: () => void }) => {
  const { user } = usePrivy();
  const [selected, setSelected] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const saveAndContinue = async () => {
    if (!selected || !user?.id) {
      nextStage();
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privyUserId: user.id, goal: selected }),
      });
    } catch (err) {
      console.error("Failed to save savings goal:", err);
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

          <LocalButton
            onClick={saveAndContinue}
            disabled={!selected || submitting}
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
