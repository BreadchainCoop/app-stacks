"use client";

import AccountCardMobile from "./account-card-mobile";
import { useConnectedAccount } from "./use-connected-account";

interface MobileAccountCardSectionProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
  claimable?: { amount: string; onClaim: () => void };
}

const MobileAccountCardSection = ({
  onDeposit,
  onWithdraw,
  claimable,
}: MobileAccountCardSectionProps) => {
  const { user, address, displayName } = useConnectedAccount();

  if (!(user.status === "CONNECTED" && address)) return null;

  return (
    <div className="md:hidden">
      <AccountCardMobile
        address={address}
        displayName={displayName}
        onDeposit={onDeposit}
        onWithdraw={onWithdraw}
        claimable={claimable}
      />
    </div>
  );
};

export default MobileAccountCardSection;
