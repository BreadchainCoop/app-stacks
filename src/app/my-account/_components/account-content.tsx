"use client";

import { Body, useConnectedUser } from "@breadcoop/ui";
import ProfileSection from "./profile-section";
import SolidarityFundSection from "./solidarity-fund-section";
import StacksOverview from "./stacks-overview";

export const AccountContent = () => {
  const { user } = useConnectedUser();
  const isConnected =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN";

  if (!isConnected) {
    return (
      <Body className="text-surface-grey">
        Please sign in to view your account activity.
      </Body>
    );
  }

  return (
    <>
      <ProfileSection />
      <StacksOverview address={user.address} />
      <SolidarityFundSection />
    </>
  );
};
