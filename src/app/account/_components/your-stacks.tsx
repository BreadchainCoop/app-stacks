import HomeHeader from "@/components/_home/header";
import { Address } from "viem";
import AccountTab from "./account-tab";
import AccountUserStacks from "./account-user-stacks";
import AccountGoals from "./account-goals";

const YourStacks = ({
  address,
  basePath,
}: {
  address: Address;
  basePath: string;
}) => (
  <div id="your-stacks" className="flex flex-col scroll-mt-6">
    <HomeHeader type="persona" address={address} />
    <AccountTab basePath={basePath} address={address} />
    <AccountUserStacks address={address} />
    <AccountGoals address={address} />
  </div>
);

export default YourStacks;
