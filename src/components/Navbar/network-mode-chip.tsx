"use client";

import { useEffect, useState } from "react";
import { useModal } from "../modal/context";
import { isLocalMode, isModeSelectable } from "@/lib/network-mode";

/** Shows the active network mode on dev/demo and reopens the selection popup. */
const NetworkModeChip = () => {
  const { setModal } = useModal();
  // Mode is resolved from localStorage, so render only after mount to avoid
  // a hydration mismatch with the SSR (Sepolia) fallback.
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || !isModeSelectable) return null;

  return (
    <button
      type="button"
      onClick={() => setModal({ type: "NETWORK_MODE_SELECT" })}
      className="self-start border border-primary-blue px-2 py-0.5 text-xs font-bold text-primary-blue transition-colors hover:bg-paper-1 md:self-center"
      title="Change network mode"
    >
      {isLocalMode() ? "Demo local" : "Demo Sepolia"}
    </button>
  );
};

export default NetworkModeChip;
