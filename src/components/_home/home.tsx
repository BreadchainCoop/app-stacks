"use client";

import { useConnectedUser } from "@breadcoop/ui";
import NewStackLists from "@/components/stack-lists/new-stack-lists";
import HomeAllStacks from "./all-stacks";

export const HomeContent = () => {
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  return (
    <div>
      <HomeAllStacks />
      <NewStackLists address={address} hideWhenEmpty />
    </div>
  );
};
