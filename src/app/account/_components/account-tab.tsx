"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import {
  HandWithdrawIcon,
  StackIcon,
  StackOverflowLogoIcon,
  WarningIcon,
} from "@phosphor-icons/react";
import { Address } from "viem";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";

export const tabs = [
  { label: "All your Stacks", id: "all", icon: StackIcon },
  { label: "Funds to Claim", id: "claim", icon: HandWithdrawIcon },
  { label: "Payments due", id: "due", icon: WarningIcon },
  { label: "Past Stacks", id: "past", icon: StackOverflowLogoIcon },
];

const AccountTab = ({
  basePath = "/",
  address,
}: {
  basePath?: string;
  address: Address;
}) => {
  const isOwner = useIsOwnAddress(address);

  return (
    <Suspense fallback={null}>
      <ProtectedTab basePath={basePath} isOwner={isOwner} />
    </Suspense>
  );
};

const ProtectedTab = ({
  basePath,
  isOwner,
}: {
  basePath: string;
  isOwner: boolean;
}) => {
  const currentTab = useSearchParams().get("tab") || "all";

  return (
    <nav className="border border-paper-2 bg-paper-0 p-2.5 max-w-max mb-6">
      <ul className="flex items-center justify-start gap-4 overflow-x-auto scrollbar-hidden">
        {[...tabs].map((tab) => {
          return (
            <li key={tab.id} className="shrink-0">
              <Link
                href={`${basePath}?tab=${tab.id}`}
                className={`font-bold flex items-center justify-center gap-2.5 py-1 px-4 border transition-colors ${
                  currentTab === tab.id
                    ? "text-surface-ink border-primary-blue"
                    : "text-surface-grey border-transparent"
                }`}
                scroll={false}
              >
                <span
                  className={`${
                    currentTab === tab.id ? "text-primary-blue" : ""
                  }`}
                >
                  <span>{<tab.icon size={20} />}</span>
                </span>
                {tab.id === "all" && !isOwner ? "All Stacks" : tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default AccountTab;
