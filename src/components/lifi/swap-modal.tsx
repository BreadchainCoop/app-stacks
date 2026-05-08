"use client";

import { ModalContainer } from "../modal/components";
import { LiFiBridgeSwapModalState, useModal } from "../modal/context";
import Bridge from "./bridge";

const LiFiSwapModal = ({
  modalState,
}: {
  modalState: LiFiBridgeSwapModalState;
}) => {
  const { setModal } = useModal();

  return (
    <ModalContainer className="max-w-140.75!">
      {/* <ModalHeader title="" /> */}
      <button
        onClick={() =>
          setModal({ type: "FUND_WALLET", address: modalState.address })
        }
        className="inline-block text-primary-blue font-semibold ml-auto cursor-pointer max-w-max"
      >
        Back
      </button>
      <Bridge userAddress={modalState.address} />
    </ModalContainer>
  );
};

export default LiFiSwapModal;
