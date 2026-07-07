import React, { useEffect, useRef } from "react";
import FundButton, { FundButtonProps } from "./fund-button";
import { createPeerExtensionSdk } from "@zkp2p/sdk";
import { FundWalletModalState, useModal } from "../../context";

const infos: FundButtonProps["infos"] = [
  { label: "$10,000 max.", bold: true },
  { label: "5 min" },
  { label: "No KYC required" },
];

type FundWithPeerProps = Omit<FundWalletModalState, "type"> & {};

const FundWithPeer = ({ ...fundWalletModalState }: FundWithPeerProps) => {
  const { setModal } = useModal();

  const peerSdkRef = useRef<ReturnType<typeof createPeerExtensionSdk> | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    peerSdkRef.current = createPeerExtensionSdk({ window });
  }, []);

  const handleOnramp = async () => {
    const sdk = peerSdkRef.current;
    if (!sdk) {
      console.error("Peer SDK not ready yet");
      return;
    }

    const state = await sdk.getState();

    if (state === "needs_install") {
      setModal({
        type: "PEER_ONRAMP_INSTALL",
        peerSdkRef,
        fundWalletModalState,
      });
      return;
    }

    if (state === "needs_connection") {
      const approved = await sdk.requestConnection();
      if (!approved) return; // user declined
    }

    setModal({ type: "PEER_ONRAMP", fundWalletModalState });
  };

  return (
    <FundButton
      imgSrc="/peer.svg"
      title="Deposit with Peer"
      infos={infos}
      onClick={handleOnramp}
    />
  );
};

export default FundWithPeer;
