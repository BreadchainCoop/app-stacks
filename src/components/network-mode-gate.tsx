"use client";

import { useEffect } from "react";
import { useModal } from "./modal/context";
import { isModeSelectable, storedNetworkMode } from "@/lib/network-mode";

/** Opens the mode-selection popup on dev/demo when no mode is stored yet. */
const NetworkModeGate = () => {
  const { setModal } = useModal();

  useEffect(() => {
    if (isModeSelectable && storedNetworkMode === null) {
      setModal({ type: "NETWORK_MODE_SELECT" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default NetworkModeGate;
