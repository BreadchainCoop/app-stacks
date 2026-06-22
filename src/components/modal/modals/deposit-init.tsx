"use client";

import { Body, Heading2, Logo } from "@breadcoop/ui";
import { ModalContainer, ModalHeader } from "../components";
import { DepositInitModalState, useModal } from "../context";
import { QuestionIcon } from "@/components/icons/question";
import DepositButton from "@/components/deposit-button";
import LocalButton from "@/components/button";

const DepositInitModal = ({
  modalState,
}: {
  modalState: DepositInitModalState;
}) => {
  const modal = useModal();
  const closeModal = () => modal.setModal(null);

  return (
    <ModalContainer>
      <ModalHeader title="Pay your deposit" />
      <div className="flex items-center justify-center">
        <Body>You are about to deposit money into your stacks.</Body>
        <div className="text-surface-grey">
          <QuestionIcon />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex items-center justify-center gap-2">
          <Logo variant="square" size={24} />
          <Heading2 className="text-5xl leading-12">
            {modalState.amount}
          </Heading2>
          <Body>BREAD</Body>
        </div>
        <div>
          <Body className="text-xs text-surface-grey">
            ${modalState.amount} USD
          </Body>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="flex-1 w-full">
          <LocalButton variant="burn" className="w-full" onClick={closeModal}>
            Cancel
          </LocalButton>
        </div>
        <div className="flex-2 w-full">
          <DepositButton
            className="w-full"
            amount={modalState.amount}
            tokenAddress={modalState.tokenAddress}
            circleId={modalState.circleId}
          />
        </div>
      </div>
    </ModalContainer>
  );
};

export default DepositInitModal;
