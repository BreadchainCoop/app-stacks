"use client";

import { useState } from "react";
import { ModalContainer } from "../components";
import { SavingsGoalsModalState, useModal } from "../context";
import SavingGoalPicker from "@/components/saving-goals/goal-picker";

export default function SavingsGoalsModal({
  modalState,
}: {
  modalState: SavingsGoalsModalState;
}) {
  const { setModal } = useModal();
  const [submitting, setSubmitting] = useState(false);

  const saveGoal = async (goalId: string | null) => {
    if (!modalState.privyUserId) return;
    setSubmitting(true);
    try {
      await fetch("/api/savings-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyUserId: modalState.privyUserId,
          goal: goalId,
        }),
      });
    } catch (err) {
      console.error("Failed to save savings goal:", err);
    } finally {
      setSubmitting(false);
      setModal(null);
    }
  };

  return (
    <ModalContainer className="max-w-[28rem]">
      <SavingGoalPicker
        onSelect={(goalId) => saveGoal(goalId)}
        onSkip={() => saveGoal(null)}
        submitting={submitting}
      />
    </ModalContainer>
  );
}
