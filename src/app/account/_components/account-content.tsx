"use client";

import { Heading2 } from "@breadcoop/ui";
import BackPage from "@/components/back-page";
import SavingGoalsModule from "./saving-goals-module";

export default function AccountContent() {
  return (
    <>
      <BackPage href="/" label="Return to dashboard" />
      <div className="max-w-155 mx-auto">
        <header className="mb-6">
          <Heading2 className="text-primary-blue text-[2.5rem] leading-9 md:text-5xl">
            My Account
          </Heading2>
        </header>
        <div className="flex flex-col gap-6">
          <SavingGoalsModule />
        </div>
      </div>
    </>
  );
}
