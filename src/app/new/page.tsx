"use client";

import { Navbar } from "@/components/Navbar/Navbar";
import { Footer } from "@/components/Footer/Footer";
import { TutorialCard } from "@/components/TutorialCard";
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

export default function NewPage() {
  const { address, isConnected } = useAccount();
  const { disconnectAsync } = useDisconnect();

  return (
    <div className="min-h-screen flex flex-col bg-paper-main">
      <Navbar />

      <main className="flex-1 w-[1280px] mx-auto">
        <div className="flex py-12">
          <LiftedButton preset="secondary">Return to dashboard</LiftedButton>
        </div>
        <TutorialCard
          onSkip={() => console.log("Skip tutorial")}
          onBack={() => console.log("Go back")}
          onNext={() => console.log("Go next")}
          currentStep={1}
          totalSteps={5}
        />
      </main>

      <Footer />
    </div>
  );
}
