"use client";

import { SignOutIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { LiftedButton } from "@breadcoop/ui";
import { useWalletHost } from "@/components/providers/is-minipay";

/**
 * Signing out of the Privy session. Privy only: in MiniPay and Nimiq Pay the
 * host *is* the wallet, so the control has nothing to do there — and their
 * stacks mount no PrivyProvider for `logout` to act on.
 *
 * Split in two so the Privy hook below is never *called* outside the Privy
 * stack, the same reasoning as `src/components/migrate-and-transfer-banner.tsx`:
 * `usePrivy()` tolerates a missing provider today by reading a default context,
 * but other Privy hooks throw without one, so relying on that is fragile.
 *
 * Kept for the Privy stack rather than removed outright: it is the only way to
 * sign out or switch accounts anywhere in the app (no ConnectButton, and
 * `providers/privy.tsx` disables Privy's own wallet UIs).
 */
const SignOutButton = ({ className }: { className?: string }) => {
  const walletHost = useWalletHost();

  if (walletHost !== "privy") return null;

  return <PrivySignOutButton className={className} />;
};

const PrivySignOutButton = ({ className }: { className?: string }) => {
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
