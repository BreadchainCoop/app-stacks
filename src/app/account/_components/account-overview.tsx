import { Address } from "viem";
import AccountProfileCard from "./account-profile-card";
import AccountBalanceCard from "./account-balance-card";
import AccountHistoryCard from "./account-history-card";

const AccountOverview = ({
  address,
  basePath,
}: {
  address: Address;
  basePath: string;
}) => (
  <section className="flex flex-col gap-3">
    <AccountProfileCard address={address} />
    <AccountBalanceCard address={address} basePath={basePath} />
    <AccountHistoryCard address={address} />
  </section>
);

export default AccountOverview;
