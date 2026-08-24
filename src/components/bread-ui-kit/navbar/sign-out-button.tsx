"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { LiftedButton } from "@breadcoop/ui";

const SignOutButton = ({ className }: { className?: string }) => {
  const { logout } = usePrivy();

  return (
    <div className={className}>
      <LiftedButton
        preset="burn"
        rightIcon={<SignOutIcon />}
        onClick={logout}
        width="full"
      >
        Sign out
      </LiftedButton>
    </div>
  );
};

export default SignOutButton;
