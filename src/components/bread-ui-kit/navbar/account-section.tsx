"use client";

import { ReactNode } from "react";
import { LoginButton, useConnectedUser } from "@breadcoop/ui";
import { SignInIcon } from "@phosphor-icons/react";
import AccountMenu from "./account-menu";

interface AccountSectionProps {
  widgetItems?: ReactNode;
  actionItems?: ReactNode;
  depositSlot?: ReactNode;
}

const AccountSection = ({
  widgetItems,
  actionItems,
  depositSlot,
}: AccountSectionProps) => {
  const { user } = useConnectedUser();

  if (user.status === "CONNECTED") {
    return (
      <AccountMenu
        widgetItems={widgetItems}
        actionItems={actionItems}
        depositSlot={depositSlot}
      />
    );
  }

  return (
    <div className="mt-6 md:mt-0">
      <LoginButton
        app="stacks"
        status={user.status}
        rightIcon={<SignInIcon size={24} />}
      />
    </div>
  );
};

export default AccountSection;
