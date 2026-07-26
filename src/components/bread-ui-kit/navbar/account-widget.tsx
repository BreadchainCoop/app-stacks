"use client";

import { ReactNode } from "react";
import { Address } from "viem";
import {
  Body,
  CopyButtonIcon,
  Logo,
  NavAccountWidgetItem,
  useBreadBalance,
  useConnectedUser,
} from "@breadcoop/ui";
import {
  ArrowUpRightIcon,
  GraphIcon,
  UserCircleIcon,
  WalletIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import SignOutButton from "./sign-out-button";

const CHAIN_ICONS: Record<number, string> = {
  100: "/gnosis_icon.svg",
};

interface AccountWidgetProps {
  className?: string;
  address: Address;
  displayName?: string;
  widgetItems?: ReactNode;
  actionItems?: ReactNode;
}

const AccountWidget = ({
  className,
  address,
  displayName,
  widgetItems,
  actionItems,
}: AccountWidgetProps) => {
  const { BREAD } = useBreadBalance({ address });
  const { user } = useConnectedUser();
  const chain =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.chain
      : undefined;
  const explorerUrl =
    chain?.blockExplorers?.default.url ?? "https://gnosisscan.io";
  const chainIcon = chain ? CHAIN_ICONS[chain.id] : undefined;

  return (
    <section
      className={cn(
        "bg-paper-2 p-5 flex flex-col gap-4 w-full max-w-md",
        className
      )}
    >
      <NavAccountWidgetItem
        I={UserCircleIcon}
        appIconColor="text-primary-blue"
        label={displayName || ""}
      >
        <CopyButtonIcon textToCopy={displayName || address} />
        <a
          href={`${explorerUrl}/address/${address}`}
          className="text-surface-grey"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ArrowUpRightIcon size={24} />
        </a>
      </NavAccountWidgetItem>
      <NavAccountWidgetItem
        I={WalletIcon}
        appIconColor="text-primary-blue"
        label="Bread Balance"
      >
        <Logo size={24} />
        <Body>{BREAD}</Body>
      </NavAccountWidgetItem>
      {widgetItems}
      <NavAccountWidgetItem
        I={GraphIcon}
        appIconColor="text-primary-blue"
        label="Network"
      >
        <div className="flex items-center justify-center">
          {chainIcon && (
            <img
              src={chainIcon}
              alt=""
              width={24}
              height={24}
              className="mr-2"
            />
          )}
          <Body className="font-bold">{chain?.name ?? "Unknown"}</Body>
        </div>
      </NavAccountWidgetItem>
      {actionItems}
      <SignOutButton className="mt-1" />
    </section>
  );
};

export default AccountWidget;
