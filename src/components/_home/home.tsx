"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useModal } from "@/components/modal/context";
import HeroBanner from "./hero-banner";
import HomeAllStacks from "./all-stacks";
import HomeLoggedInDetails from "./logged-in-details";

export const HomeContent = () => {
  const searchParams = useSearchParams();
  const { setModal } = useModal();

  useEffect(() => {
    const onboarding = searchParams.get("onboarding");
    if (onboarding === "visitor") {
      setModal({ type: "VISITOR_ONBOARDING" });
    } else if (onboarding === "logged-in") {
      setModal({ type: "LOGGED_IN_ONBOARDING" });
    }
  }, [searchParams, setModal]);

  return (
    <div>
      <HeroBanner />
      <HomeLoggedInDetails />
      <HomeAllStacks />
    </div>
  );
};
