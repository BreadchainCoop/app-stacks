"use client";

import { Address } from "viem";
import AccountBalanceSummary from "./account-balance-summary";
import AccountPendingActions from "./account-pending-actions";

const cardClass =
  "border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26] md:p-8";

const AccountBalanceCard = ({
  address,
  basePath,
}: {
  address: Address;
  basePath: string;
}) => {
  return (
    <div className={`flex flex-col gap-6 ${cardClass}`}>
      <AccountBalanceSummary address={address} />

      <div className="mx-auto h-px w-full max-w-[500px] bg-paper-2" />

      <AccountPendingActions address={address} basePath={basePath} />
    </div>
  );
};

export default AccountBalanceCard;
