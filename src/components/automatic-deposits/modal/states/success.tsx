"use client";

import LocalButton from "@/components/button";
import {
  ModalContainer,
  ModalHeader,
  ModalStatus,
} from "@/components/modal/components";
import { Body } from "@breadcoop/ui";

export const SuccessState = ({
  enabling,
  onClose,
}: {
  enabling: boolean;
  onClose: () => void;
}) => (
  <ModalContainer status="success" className="max-w-142!">
    <ModalHeader title="Automatic Deposits successful" />
    <ModalStatus
      status="success"
      statusMsg={`Automatic deposits ${enabling ? "activated" : "deactivated"}!`}
    />
    <Body className="text-center text-surface-grey">
      {enabling
        ? "Your deposit will be sent automatically each round. Keep your wallet funded by each deadline."
        : "Automatic deposits have been deactivated."}
    </Body>
    <div className="lifted-button-container">
      <LocalButton onClick={onClose}>Return to stack</LocalButton>
    </div>
  </ModalContainer>
);
