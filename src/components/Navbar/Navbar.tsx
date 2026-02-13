"use client";

import { Navbar as LibNavbar, LiftedButton } from "@breadcoop/ui";
import Link from "next/link";
import ClaimableWidget from "./claimable-widget";
import { HandWithdrawIcon } from "@phosphor-icons/react";
import { useModal } from "../modal/context";

function WidgetItems() {
  return (
    <>
      <ClaimableWidget />
    </>
  );
}

function ActionItems() {
  const { setModal } = useModal();
  return (
    <div className="-mb-3">
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
