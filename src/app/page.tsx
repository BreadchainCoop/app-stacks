"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import {
  LiftedButton,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Body,
  Caption,
} from "@breadcoop/ui";
import { LINKS } from "@/constants/links";
import { AccountMenu } from "@/components/AccountMenu";
import { SignInIcon } from "@phosphor-icons/react/ssr";
import Image from "next/image";
import Link from "next/link";
import { useAccount, useDisconnect } from "wagmi";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();
  return (
    <div className="min-h-screen flex flex-col bg-paper-main">
      <Navbar />

      <main className="flex-1 w-[1280px] mx-auto">
        <div className="py-12">
          <Heading3>Your Stacks dashboard</Heading3>
        </div>
        <div>
          {isConnected && (
            <div>
              <Body>Connected to {address}</Body>
              <div className="flex">
                <LiftedButton
                  onClick={() => {
                    disconnectAsync();
                  }}
                >
                  Disconnect
                </LiftedButton>
              </div>
            </div>
          )}
          {!isConnected && (
            <div>
              <Body>
                You are not signed in. Please sign in to view your account
                stats.
              </Body>

              <div className="flex ">
                <AccountMenu>Sign in to view dashboard</AccountMenu>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
