"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDownIcon,
  ArrowUpRightIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  List,
  X,
} from "@phosphor-icons/react/ssr";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useState, useEffect, useRef } from "react";
import { LiftedButton, Logo, Body, Heading4, Heading3 } from "@breadcoop/ui";
import { SOLIDARITY_TOOLS } from "@/constants/solidarityTools";
import { LINKS } from "@/constants/links";
import { AccountMenu } from "../AccountMenu";

interface NavbarProps {
  static?: boolean;
}

export function Navbar({ static: isStatic = false }: NavbarProps) {
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
