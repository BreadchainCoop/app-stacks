"use client";

import Alert from "@/components/alert";
import LocalButton from "@/components/button";
import { ModalContainer } from "@/components/modal/components";
import { Body, Heading3 } from "@breadcoop/ui";
import { ArrowRightIcon, HandDepositIcon } from "@phosphor-icons/react";
import { ModalClose } from "../shared";

export const IntroState = ({
  onClose,
  onContinue,
}: {
  onClose: () => void;
  onContinue: () => void;
}) => (
  <ModalContainer className="max-w-142!">
    <ModalClose onClick={onClose} />
    <div className="flex flex-col items-center text-center gap-2">
      <HandDepositIcon size={48} className="fill-primary-blue" />
      <Heading3 className="text-2xl">Automatic Deposits</Heading3>
      <Body bold className="text-surface-grey-2">
        You&apos;re granting a limited spending permission
      </Body>
    </div>
    <Body className="text-center text-surface-grey">
      Once activated, your deposit will be sent automatically each round.
      We&apos;ll only move the exact amount required. You can turn this off
      anytime.
    </Body>
    <Alert
      closeAble={false}
      variant="warning"
      title="Keep your wallet funded"
      description="If your wallet lacks funds at deposit, the Stack will discontinue. Make sure you have enough balance by each deadline."
    />
    <div className="lifted-button-container">
      <LocalButton rightIcon={<ArrowRightIcon />} onClick={onContinue}>
        Continue
      </LocalButton>
    </div>
  </ModalContainer>
);
