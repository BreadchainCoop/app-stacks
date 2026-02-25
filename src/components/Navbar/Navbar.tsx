"use client";

import { Navbar as LibNavbar, LiftedButton } from "@breadcoop/ui";
import Link from "next/link";
import ClaimableWidget from "./claimable-widget";
import { CoinsIcon, HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../modal/context";
import { useWalletFunding } from "@/hooks/use-wallet-funding";

function WidgetItems() {
  return (
    <>
      <ClaimableWidget />
    </>
  );
}

function ActionItems() {
  const { setModal } = useModal();
  const {
    helperCopy,
    isFunding,
    handleFundWallet,
    privyReady,
    authenticated,
    walletsReady,
  } = useWalletFunding();
  const handleFundWithStatus = async () => {
    setModal({
      type: "WALLET_FUNDING_STATUS",
      status: "loading",
    });
    const didFund = await handleFundWallet();
    setModal({
      type: "WALLET_FUNDING_STATUS",
      status: didFund ? "success" : "error",
      onRetry: handleFundWithStatus,
    });
  };

  return (
    <div className="-mb-3 flex flex-col gap-2">
      <LiftedButton
        rightIcon={<CoinsIcon />}
        width="full"
        className="bg-[#DDF7D0]! text-[#155D2A]! font-bold"
        onClick={handleFundWithStatus}
        disabled={!privyReady || !authenticated || !walletsReady || isFunding}
      >
        {isFunding ? "Opening..." : "Fund Stacks wallet"}
      </LiftedButton>
      <p className="px-1 text-xs leading-4 text-[#155D2A]">{helperCopy}</p>
      <LiftedButton
        rightIcon={<HandWithdrawIcon />}
        width="full"
        className="bg-[#B9D5FF]! text-primary-blue! font-bold"
        onClick={() => setModal({ type: "WITHDRAW_BREAD" })}
      >
        Withdraw BREAD
      </LiftedButton>
    </div>
  );
}

export function Navbar() {
  return (
    <LibNavbar
      app="stacks"
      className="page-layout relative z-30"
      widgetItems={<WidgetItems />}
      actionItems={<ActionItems />}
    >
      <nav className="flex flex-col gap-2 md:flex-row md:gap-4 md:mr-8">
        <Link href="/" className="text-body">
          Dashboard
        </Link>
        <Link href="/new" className="text-body">
          Start stacks group
        </Link>
      </nav>
    </LibNavbar>
  );
}
