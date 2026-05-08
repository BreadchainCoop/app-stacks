import React from "react";
import FundButton, { FundButtonProps } from "./fund-button";

const infos: FundButtonProps["infos"] = [
  { label: "$10,000 max.", bold: true },
  { label: "5 min" },
  { label: "No KYC required" },
];

const FundWithPeer = () => {
  return (
    <FundButton
      imgSrc="/peer.svg"
      title="Deposit with Peer"
      infos={infos}
      onClick={() => {}}
    />
  );
};

export default FundWithPeer;
