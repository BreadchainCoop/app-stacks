"use client";

import Link from "next/link";
import { Logo, Body } from "@breadcoop/ui";
import { AccountMenu } from "../AccountMenu";

export function Navbar() {
  return (
    <>
      <div className="m-2 w-[1280px] mx-auto flex items-center justify-between">
        {/* Left side - Logo and Stacks */}
        <div className="flex items-center gap-4">
          <div className="text-[24px]">
            <Link href="/">
              <Logo color="blue" text="BREAD" size={24} />
            </Link>
          </div>
          <Body className="text-[24px] mt-[2px] text-surface-grey-2">
            Stacks
          </Body>
        </div>

        {/* Right side - Navigation items and Account Menu */}
        <div className="flex items-center gap-6">
          <Body>
            <Link href="/new">Start saving group</Link>
          </Body>
          <Body>Groups</Body>
          <Body>Dashboard</Body>
          <AccountMenu fullWidth={true}>Sign in</AccountMenu>
        </div>
      </div>
    </>
  );
}
