"use client";

import LocalButton from "@/components/button";
import { ModalContainer } from "@/components/modal/components";
import { Body, Heading3 } from "@breadcoop/ui";
import { HandDepositIcon } from "@phosphor-icons/react";
import { ModalClose } from "../shared";

export const DeactivateConfirmState = ({
  onClose,
  onDeactivate,
}: {
  onClose: () => void;
  onDeactivate: () => void;
}) => (
  <ModalContainer className="max-w-142!">
    <ModalClose onClick={onClose} />
    <div className="flex flex-col items-center justify-center text-center">
      <HandDepositIcon size={48} className="fill-primary-blue" />
      <Heading3 className="text-2xl mt-3 mb-6">
        Deactivate Automatic Deposits
      </Heading3>
      <Body className="mb-6 text-surface-grey">
        By deactivating automatic deposits you will need to manually deposit
        each round before the deadline.
      </Body>
      <div className="lifted-button-container">
        <LocalButton onClick={onDeactivate}>
          Deactivate automatic deposits
        </LocalButton>
      </div>
    </div>
  </ModalContainer>
);
