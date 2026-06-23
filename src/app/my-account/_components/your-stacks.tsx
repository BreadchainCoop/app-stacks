"use client";

import HomeHeader from "@/components/_home/header";
import HomeTab from "@/components/_home/tab";
import HomeUserStacks from "@/components/_home/user-stacks";
import { Address } from "viem";

const YourStacks = ({ address }: { address: Address }) => (
  <div id="your-stacks" className="flex flex-col scroll-mt-6">
    <HomeHeader type="persona" />
    <HomeTab basePath="/my-account" />
    <HomeUserStacks address={address} />
  </div>
);

export default YourStacks;
