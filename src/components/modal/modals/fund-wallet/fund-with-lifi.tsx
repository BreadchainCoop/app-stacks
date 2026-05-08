import React from "react";
import FundButton, { FundButtonProps } from "./fund-button";

const infos: FundButtonProps["infos"] = [
  { label: "No limit" },
  { label: "Instant" },
  { label: "Powered by Li.Fi", className: "text-xs" },
];

const FundWithLifi = () => {
  return (
    <FundButton
      imgSrc="/currency-eth.svg"
      title="Transfer crypto"
      infos={infos}
      onClick={() => {}}
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
