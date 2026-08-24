"use client";

import { useConnectedUser } from "@breadcoop/ui";
import { Navbar as BreadNavbar } from "@/components/bread-ui-kit/navbar";
import { useModal } from "../modal/context";
import WidgetItems from "./widget-items";
import ActionItems from "./action-items";
import NavLinks from "./nav-links";
import NetworkModeChip from "./network-mode-chip";
import LocalAccountSwitcher from "./local-account-switcher";
import NavDepositButton from "../bread-ui-kit/navbar/nav-deposit-button";

export function Navbar() {
  const { user } = useConnectedUser();
  const { setModal } = useModal();

  const openFundFlow = () => {
    if (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") {
      setModal({ type: "FUND_WALLET", address: user.address });
    }
  };

  const openWithdrawFlow = () => {
    setModal({ type: "WITHDRAW_BREAD" });
  };

  return (
    <BreadNavbar
      className="page-layout relative z-30"
      widgetItems={<WidgetItems />}
      actionItems={<ActionItems />}
      depositSlot={<NavDepositButton app="stacks" onClick={openFundFlow} />}
      onDeposit={openFundFlow}
      onWithdraw={openWithdrawFlow}
    >
      <NavLinks />
      <div className="flex flex-col gap-2 md:mr-4 md:flex-row md:items-center md:gap-3">
        <NetworkModeChip />
        <LocalAccountSwitcher />
      </div>
    </BreadNavbar>
  );
}
