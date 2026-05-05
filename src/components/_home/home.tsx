"use client";

import HomeAllStacks from "./all-stacks";
import HomeLoggedInDetails from "./logged-in-details";

export const HomeContent = () => {
  return (
    <div>
      <HomeLoggedInDetails />
      <HomeAllStacks />
    </div>
  );
};
