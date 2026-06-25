import HomeHeader from "@/components/_home/header";
import { Address } from "viem";
import AccountTab from "./account-tab";
import AccountUserStacks from "./account-user-stacks";

const YourStacks = ({ address }: { address: Address }) => (
  <div id="your-stacks" className="flex flex-col scroll-mt-6">
    <HomeHeader type="persona" />
    <AccountTab basePath="/my-account" />
    <AccountUserStacks address={address} />
  </div>
);

export default YourStacks;
