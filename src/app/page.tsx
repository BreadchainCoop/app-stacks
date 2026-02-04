"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import {
  LiftedButton,
  Heading3,
  Body,
} from "@breadcoop/ui";
import { AccountMenu } from "@/components/AccountMenu";
import { usePrivy } from "@privy-io/react-auth";

export default function Home() {
  const { ready, authenticated, user, logout } = usePrivy();
  const address = user?.wallet?.address;

  return (
    <div className="min-h-screen flex flex-col bg-paper-main">
      <Navbar />

      <main className="flex-1 w-[1280px] mx-auto">
        <div className="py-12">
          <Heading3>Your Stacks dashboard</Heading3>
        </div>
        <div>
          {ready && authenticated && (
            <div>
              <Body>Connected to {address}</Body>
              <div className="flex">
                <LiftedButton onClick={logout}>Disconnect</LiftedButton>
              </div>
            </div>
          )}
          {ready && !authenticated && (
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
