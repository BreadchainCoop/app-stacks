"use client";

import { useEffect } from "react";
import { useConnectedUser } from "@breadcoop/ui";
import { useSupabaseClient } from "./supabase";
import { ensureLocalUser } from "@/lib/local-supabase";
import { isLocalMode } from "@/lib/network-mode";

/**
 * Local mode: creates the synthetic supabase user ("local:<address>") for the
 * connected Anvil account, mirroring what /api/onboard does after Privy login.
 */
const LocalUserBootstrap = () => {
  const { user } = useConnectedUser();
  const supabase = useSupabaseClient();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  useEffect(() => {
    if (!isLocalMode() || !address) return;

    ensureLocalUser(supabase, address).catch((err) =>
      console.error("Failed to ensure local user:", err)
    );
  }, [address, supabase]);

  return null;
};

export default LocalUserBootstrap;
