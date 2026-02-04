"use client";

import { ReactNode } from "react";
import { LiftedButton } from "@breadcoop/ui";
import { SignInIcon } from "@phosphor-icons/react/dist/ssr";
import { usePrivy } from "@privy-io/react-auth";

export function AccountMenu({
  fullWidth = false,
  children,
}: {
  fullWidth?: boolean;
  children: ReactNode;
}) {
  const { ready, authenticated, login, user } = usePrivy();

  if (!ready) {
    return (
      <div
        style={{
          opacity: 0,
          pointerEvents: "none",
          userSelect: "none",
        }}
        aria-hidden
      >
        <LiftedButton rightIcon={<SignInIcon />}>{children}</LiftedButton>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="flex gap-12">
        <LiftedButton onClick={login} rightIcon={<SignInIcon />}>
          {children}
        </LiftedButton>
      </div>
    );
  }

  const walletAddress = user?.wallet?.address;
  const displayAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Connected";

  return (
    <div className="flex gap-12">
      <span className="text-breadgray-rye text-sm">{displayAddress}</span>
    </div>
  );
}
