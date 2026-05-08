"use client";

import FundButton, { FundButtonProps } from "./fund-button";
import { LiFiBridgeSwapModalState, useModal } from "../../context";

const infos: FundButtonProps["infos"] = [
  { label: "No limit" },
  { label: "Instant" },
  { label: "Powered by Li.Fi", className: "text-xs" },
];

const FundWithLifi = ({
  address,
}: Pick<LiFiBridgeSwapModalState, "address">) => {
  const { setModal } = useModal();
  const openBridge = () => {
    setModal({ type: "LIFI_BRIDGE_SWAP", address });
  };

  return (
    <FundButton
      imgSrc="/currency-eth.svg"
      title="Transfer crypto"
      infos={infos}
      onClick={openBridge}
      leftItem={
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/lifi-chains.svg" alt="" className="w-36" />
        </figure>
      }
    />
  );
};

export default FundWithLifi;
