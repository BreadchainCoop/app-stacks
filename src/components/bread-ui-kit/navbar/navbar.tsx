"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Logo, useConnectedUser } from "@breadcoop/ui";
import { cn } from "@/lib/utils";
import {
  SolidarityAppsDesktopMenu,
  SolidarityAppsMobile,
} from "./solidarity-apps";
import NavbarMenu from "./navbar-menu";
import MobileAccountCardSection from "./mobile-account-card-section";
import AccountSection from "./account-section";
import SignOutButton from "./sign-out-button";

export interface BreadNavbarProps {
  className?: string;
  children: ReactNode;
  widgetItems?: ReactNode;
  actionItems?: ReactNode;
  depositSlot?: ReactNode;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  claimable?: { amount: string; onClaim: () => void };
}

export function Navbar({
  className = "",
  children,
  widgetItems,
  actionItems,
  depositSlot,
  onDeposit,
  onWithdraw,
  claimable,
}: BreadNavbarProps) {
  const { user } = useConnectedUser();

  return (
    <div
      className={cn(
        "relative py-2.5 flex items-center justify-between",
        className
      )}
    >
      <Link href="/" className="flex items-center">
        <Logo size={24} color="blue" className="md:hidden" />
        <span className="hidden md:block lg:text-2xl">
          <Logo text="BREAD" size={24} color="blue" />
        </span>
      </Link>
      <SolidarityAppsDesktopMenu />
      <NavbarMenu
        mobileHeader={
          <Link href="/">
            <Logo color="blue" text="Stacks" />
          </Link>
        }
        mobileTop={
          <MobileAccountCardSection
            onDeposit={onDeposit}
            onWithdraw={onWithdraw}
            claimable={claimable}
          />
        }
        footer={
          <>
            <SolidarityAppsMobile className="mt-6 md:hidden" />
            {user.status === "CONNECTED" && (
              <SignOutButton className="md:hidden mt-2" />
            )}
            <AccountSection
              widgetItems={widgetItems}
              actionItems={actionItems}
              depositSlot={depositSlot}
            />
          </>
        }
      >
        {children}
      </NavbarMenu>
    </div>
  );
}
