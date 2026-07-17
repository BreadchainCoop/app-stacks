"use client";

import { useEffect, useState } from "react";
import { Body } from "@breadcoop/ui";
import { PencilSimpleIcon, TargetIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import SectionHeader from "./section-header";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { savingGoalOptions } from "@/components/saving-goals/goal-picker";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { useConnectedUser } from "@breadcoop/ui";

const SavingGoalsSection = () => {
  const { user: privyUser } = usePrivy();
  const { user } = useConnectedUser();
  const { setModal } = useModal();
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : null;
  const isOwner = useIsOwnAddress(address ?? "");

  useEffect(() => {
    if (!privyUser?.id) return;
    fetch(`/api/savings-goals?privyUserId=${encodeURIComponent(privyUser.id)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.goals?.length) setGoals(data.goals);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [privyUser?.id]);

  if (!isOwner || loading) return null;

  const selectedGoals = savingGoalOptions.filter((g) => goals.includes(g.id));

  const handleEdit = () => {
    if (privyUser?.id) {
      setModal({ type: "SAVINGS_GOALS", privyUserId: privyUser.id });
    }
  };

  return (
    <section className="flex flex-col gap-6">
      <SectionHeader
        I={TargetIcon}
        iconColor="text-primary-blue"
        title="Your saving goals"
        subtitle="What you're saving for with your Stacks"
      />
      <div className="flex items-center justify-between border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26]">
        <div className="flex-1">
          {selectedGoals.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedGoals.map((goalInfo) => {
                const IconComp = goalInfo.icon;
                return (
                  <span
                    key={goalInfo.id}
                    className="flex items-center gap-1.5 border border-primary-blue bg-blue-0/10 px-3 py-1.5 text-sm text-surface-ink"
                  >
                    <IconComp
                      size={16}
                      weight="fill"
                      className="text-primary-blue"
                    />
                    {goalInfo.label}
                  </span>
                );
              })}
            </div>
          ) : (
            <Body className="text-surface-grey">
              Tell us more about your goals
            </Body>
          )}
        </div>
        <LocalButton
          variant="secondary"
          size="sm"
          leftIcon={<PencilSimpleIcon size={16} />}
          onClick={handleEdit}
          className="ml-4 shrink-0"
        >
          Edit
        </LocalButton>
      </div>
    </section>
  );
};

export default SavingGoalsSection;
