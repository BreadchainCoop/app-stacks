"use client";

import LocalButton from "@/components/button";
import {
  ModalContainer,
  ModalHeader,
  ModalStatus,
} from "@/components/modal/components";
import { Body } from "@breadcoop/ui";

export const GeneralErrorState = ({
  onTryAgain,
}: {
  onTryAgain: () => void;
}) => (
  <ModalContainer status="error" className="max-w-142!">
    <ModalHeader title="Automatic Deposits failed" />
    <ModalStatus status="error" statusMsg="Transaction failed" />
    <Body bold className="text-center text-surface-grey">
      Something went wrong. Please try again!
    </Body>
    <LocalButton
      variant="destructive"
      className="lifted-button-container"
      onClick={onTryAgain}
    >
      Try again
    </LocalButton>
  </ModalContainer>
);
