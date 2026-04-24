"use client";

import { clientEnv } from "@/lib/env";
import HomeAllStacks from "./all-stacks";
// import HomeLoggedInDetails from "./logged-in-details";

console.log(
  "__ CONTRACT PROXY __",
  clientEnv.NEXT_PUBLIC_SAVING_CIRCLES_CONTRACT_ADDRESS
);

console.log("__ BREAD TOKEN __", clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS);

export const HomeContent = () => {
  return (
    <div>
      {/* <HomeLoggedInDetails /> */}
      <HomeAllStacks />
    </div>
  );
};
