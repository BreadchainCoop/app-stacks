import React, { Dispatch, SetStateAction } from "react";
import FundButton, { FundButtonProps } from "./fund-button";
import { createPeerExtensionSdk, PeerIntentFulfilledResult } from "@zkp2p/sdk";
import { useEffect, useRef } from "react";
import { FundWalletModalState, useModal } from "../../context";
// import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
// import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
// import { encodeFunctionData } from "viem";
// import { breadAbi } from "@/lib/abis/bread-abi";
// import { clientEnv } from "@/lib/env";

const infos: FundButtonProps["infos"] = [
  { label: "$10,000 max.", bold: true },
  { label: "5 min" },
  { label: "No KYC required" },
];

type FundWithPeerProps = Omit<FundWalletModalState, "type"> & {
  setResult: Dispatch<SetStateAction<PeerIntentFulfilledResult | null>>;
};

const XDAI_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000";
const XDAI_DESTINATION_TOKEN = `100:${XDAI_TOKEN_ADDRESS}`;

const FundWithPeer = ({
  setResult,
  ...fundWalletModalState
}: FundWithPeerProps) => {
  const { setModal } = useModal();
  // const { sendSponsoredTransaction } = useSponsoredTx();
  // const { waitForTxReceipt } = useWaitForTxReceipt();

  const peerSdkRef = useRef<ReturnType<typeof createPeerExtensionSdk> | null>(
    null
  );
  const peerUnsubscribe = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    peerSdkRef.current = createPeerExtensionSdk({ window });

    return () => {
      peerUnsubscribe.current?.();
    };
  }, []);

  // const mintBread = async (amount: bigint) => {
  //   setModal({ type: "WALLET_FUNDING_STATUS", status: "loading" });

  //   try {
  //     const data = encodeFunctionData({
  //       abi: breadAbi,
  //       functionName: "mint",
  //       args: [fundWalletModalState.address],
  //     });

  //     const { hash } = await sendSponsoredTransaction(
  //       {
  //         to: clientEnv.NEXT_PUBLIC_BREAD_TOKEN_ADDRESS,
  //         data,
  //         value: amount,
  //       },
  //       { uiOptions: { showWalletUIs: false } }
  //     );

  //     setModal({ type: "WALLET_FUNDING_STATUS", status: "success" });
  //     void (await waitForTxReceipt(hash));
  //   } catch (error) {
  //     console.error("Peer onramp: minting bread error:", error);
  //     setModal({ type: "WALLET_FUNDING_STATUS", status: "error" });
  //   }
  // };

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

    // Register before calling onramp() per SDK requirements.
    peerUnsubscribe.current?.();
    peerUnsubscribe.current = sdk.onIntentFulfilled(async (result) => {
      if (result.bridge.status === "pending") {
        console.log("Bridge pending:", result.bridge.trackingUrl);
        return;
      }

      console.log("__ PEER BRIDGE RESULT __", result);
      setResult(result);

      if (result.destinationToken !== XDAI_DESTINATION_TOKEN) {
        console.error(
          "Peer onramp: unexpected destination token:",
          result.destinationToken
        );
        return;
      }

      if (result.recipientAddress !== fundWalletModalState.address) {
        console.error(
          "Peer onramp: recipient address mismatch:",
          result.recipientAddress
        );
        return;
      }

      const outputAmount = result.bridge.outputAmount;
      if (!outputAmount) {
        console.error("Peer onramp: missing outputAmount on fulfilled result");
        return;
      }

      // await mintBread(BigInt(outputAmount));
    });

    sdk.onramp({
      toToken: XDAI_DESTINATION_TOKEN,
      referrer: "Stacks",
      referrerLogo: "https://fund.bread.coop/logo.svg",
      recipientAddress: fundWalletModalState.address,
    });
  };

  return (
    <>
      <FundButton
        imgSrc="/peer.svg"
        title="Deposit with Peer"
        infos={infos}
        onClick={handleOnramp}
      />
    </>
  );
};

export default FundWithPeer;
