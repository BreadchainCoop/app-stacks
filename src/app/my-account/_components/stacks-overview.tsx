import { Address } from "viem";
import AccountOverviewCard from "./account-overview-card";
import YourStacks from "./your-stacks";

const StacksOverview = ({ address }: { address: Address }) => (
  <section className="flex flex-col gap-6">
    <AccountOverviewCard address={address} />
    <YourStacks address={address} />
  </section>
);

export default StacksOverview;
