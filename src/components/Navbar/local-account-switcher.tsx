"use client";

import { useEffect, useState } from "react";
import {
  LOCAL_ANVIL_ACCOUNTS,
  getLocalAccountIndex,
  isLocalMode,
  setLocalAccountIndex,
} from "@/lib/network-mode";
import { formatAddress } from "@/utils/address";

/**
 * Switch between the 10 Anvil dev accounts in local mode. Selecting one
 * persists the index and reloads the page (reload-on-switch).
 */
const LocalAccountSwitcher = () => {
  // Mode and account index come from localStorage, so render after mount only.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isLocalMode()) return null;

  return (
    <select
      value={getLocalAccountIndex()}
      onChange={(e) => setLocalAccountIndex(Number(e.target.value))}
      className="self-start border border-primary-blue bg-paper-0 px-2 py-0.5 text-xs font-bold text-primary-blue md:self-center"
      title="Switch local Anvil account (reloads the page)"
    >
      {LOCAL_ANVIL_ACCOUNTS.map((address, i) => (
        <option key={address} value={i}>
          Account {i} — {formatAddress(address)}
        </option>
      ))}
    </select>
  );
};

export default LocalAccountSwitcher;
