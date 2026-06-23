"use client";

import HeroBanner from "./hero-banner";
import HomeAllStacks from "./all-stacks";
import HomeLoggedInDetails from "./logged-in-details";

export const HomeContent = () => {
  return (
    <div>
      <HeroBanner />
      <HomeLoggedInDetails />
      <HomeAllStacks />
    </div>
  );
};
