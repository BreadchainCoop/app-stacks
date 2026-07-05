"use client";

import { Body } from "@breadcoop/ui";
import { PencilSimpleIcon, UserCircleIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import SectionHeader from "./section-header";
import LocalButton from "@/components/button";
import { useModal } from "@/components/modal/context";
import { useMyProfile } from "@/hooks/use-my-profile";

const ProfileSection = () => {
  const { user: privyUser } = usePrivy();
  const { setModal } = useModal();
  const { alias, isLoading } = useMyProfile(privyUser?.id);

  return (
    <section className="flex flex-col gap-6">
      <SectionHeader
        I={UserCircleIcon}
        iconColor="text-primary-blue"
        title="Profile"
        subtitle="How other members see you in your Stacks"
      />
      <div className="flex items-center justify-between border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26]">
        <div>
          <Body className="text-surface-grey">Alias</Body>
          <Body bold className="text-lg text-surface-ink">
            {isLoading ? "Loading..." : alias || "Not set"}
          </Body>
        </div>
        <LocalButton
          variant="secondary"
          size="sm"
          leftIcon={<PencilSimpleIcon size={16} />}
          onClick={() => setModal({ type: "SET_ALIAS" })}
        >
          {alias ? "Edit" : "Set alias"}
        </LocalButton>
      </div>
    </section>
  );
};

export default ProfileSection;
