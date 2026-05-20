"use client";

import {
  Navbar as LibNavbar,
  LiftedButton,
  useConnectedUser,
} from "@breadcoop/ui";
import Link from "next/link";
import ClaimableWidget from "./claimable-widget";
import { CoinsIcon, HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../modal/context";
import { BreadText } from "./bread-text";

function WidgetItems() {
  return (
    <>
      <ClaimableWidget />
    </>
  );
}

function ActionItems() {
  const { user } = useConnectedUser();
  const { setModal } = useModal();
  const handleFund = async () => {
    if (user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") {
      console.log("HANDLE FUND");
      setModal({
        type: "FUND_WALLET",
        address: user.address,
        // onFunded: () => {
        //   setModal({
        //     type: "WALLET_FUNDING_STATUS",
        //     status: "success",
        //     breadAmount: "0",
        //   });
        // },
      });
    }
  };

  return (
    <div className="-mb-3 flex flex-col gap-2">
      <LiftedButton
        rightIcon={<CoinsIcon />}
        width="full"
        className="bg-[#DDF7D0]! text-[#155D2A]! font-bold"
        onClick={handleFund}
      >
        Fund Stacks wallet
      </LiftedButton>
      <BreadText
        address={
          user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
            ? user.address
            : undefined
        }
      />
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
