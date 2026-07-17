"use client";

import { useEffect, useState } from "react";
import { Body, Heading3 } from "@breadcoop/ui";
import { PencilSimpleIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { savingGoalOptions } from "@/components/saving-goals/goal-picker";

export default function SavingGoalsModule() {
  const { user } = usePrivy();
  const { setModal } = useModal();
  const [goal, setGoal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`/api/savings-goals?privyUserId=${encodeURIComponent(user.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.goal) setGoal(data.goal);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const goalInfo = goal ? savingGoalOptions.find((g) => g.id === goal) : null;

  const handleEdit = () => {
    if (user?.id) {
      setModal({ type: "SAVINGS_GOALS", privyUserId: user.id });
    }
  };

  if (loading) return null;

  return (
    <div className="card-shadow-border card-shadow-bg flex flex-col gap-4 p-6">
      <div className="flex items-center justify-between">
        <Heading3 className="text-xl leading-6">Your saving goals</Heading3>
        <LocalButton
          variant="secondary"
          onClick={handleEdit}
          className="text-sm"
          leftIcon={<PencilSimpleIcon size={16} />}
        >
          Edit
        </LocalButton>
      </div>
      {goalInfo ? (
        <div className="flex items-center gap-3 border border-primary-blue bg-blue-0/10 p-3">
          <goalInfo.icon
            size={24}
            weight="fill"
            className="text-primary-blue"
          />
          <div>
            <Body bold className="text-sm">
              {goalInfo.label}
            </Body>
            <Body className="text-xs text-surface-grey">
              {goalInfo.description}
            </Body>
          </div>
        </div>
      ) : (
        <Body className="text-surface-grey">Tell us more about your goals</Body>
      )}
    </div>
  );
}
