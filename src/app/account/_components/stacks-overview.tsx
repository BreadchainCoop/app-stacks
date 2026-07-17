import { Address } from "viem";
import AccountOverviewCard from "./account-overview-card";
import YourStacks from "./your-stacks";

const StacksOverview = ({
  address,
  basePath,
}: {
  address: Address;
  basePath: string;
}) => (
  <section className="flex flex-col gap-6">
    <AccountOverviewCard address={address} basePath={basePath} />
    <YourStacks address={address} basePath={basePath} />
  </section>
);

export default StacksOverview;
