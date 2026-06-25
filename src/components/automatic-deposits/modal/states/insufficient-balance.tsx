"use client";

import LocalButton from "@/components/button";
import { ModalContainer, ModalStatus } from "@/components/modal/components";
import { Body, Caption, Heading3 } from "@breadcoop/ui";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";
import { BreadAmount, ModalClose, SummaryRow } from "../shared";

export const InsufficientBalanceState = ({
  required,
  balance,
  missing,
  onClose,
  onFundWallet,
}: {
  required: bigint;
  balance: bigint;
  missing: bigint;
  onClose: () => void;
  onFundWallet: () => void;
}) => (
  <ModalContainer status="error" className="max-w-142!">
    <ModalClose onClick={onClose} />
    <ModalStatus
      status="error"
      statusMsg="You don't have enough balance to activate this"
    />
    <Heading3 className="text-2xl text-center -mt-2">
      Automatic Deposits failed
    </Heading3>
    <Body bold className="text-center text-surface-grey">
      Your wallet needs more funds
    </Body>
    <div className="border border-blue-0 p-4 flex flex-col gap-4">
      <SummaryRow label="Required">
        <BreadAmount value={required} />
      </SummaryRow>
      <SummaryRow label="Your balance">
        <BreadAmount value={balance} />
      </SummaryRow>
      <SummaryRow label="Missing">
        <BreadAmount value={missing} highlighted />
      </SummaryRow>
      <Caption className="text-surface-grey">1 BREAD = 1 USD</Caption>
    </div>
    <div className="lifted-button-container">
      <LocalButton
        variant="destructive"
        rightIcon={<ArrowSquareOutIcon />}
        onClick={onFundWallet}
      >
        Fund wallet
      </LocalButton>
    </div>
  </ModalContainer>
);
