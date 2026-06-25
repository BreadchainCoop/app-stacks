"use client";

import LocalButton from "@/components/button";
import { ModalContainer } from "@/components/modal/components";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { formatAddress } from "@/utils/address";
import { Body, Caption, Heading3 } from "@breadcoop/ui";
import {
  ArrowsClockwiseIcon,
  ArrowUpRightIcon,
  CalendarIcon,
  HandDepositIcon,
} from "@phosphor-icons/react";
import {
  automaticContractExplorerLink,
  BreadAmount,
  getIntervalLabels,
  ModalClose,
  SummaryRow,
} from "../shared";

export const SummaryState = ({
  depositAmount,
  remainingRounds,
  depositInterval,
  totalDeposit,
  onClose,
  onActivate,
}: {
  depositAmount: bigint;
  remainingRounds: number;
  depositInterval: bigint;
  totalDeposit: bigint;
  onClose: () => void;
  onActivate: () => void;
}) => {
  const { intervalLabel, perRoundLabel } = getIntervalLabels(depositInterval);
  const contractLink = automaticContractExplorerLink();

  return (
    <ModalContainer className="max-w-142!">
      <ModalClose onClick={onClose} />
      <div className="flex flex-col items-center text-center gap-2">
        <HandDepositIcon size={48} className="fill-primary-blue" />
        <Heading3 className="text-2xl">Automatic Deposits</Heading3>
        <Body bold className="text-surface-grey-2">
          You&apos;re granting a limited spending permission
        </Body>
      </div>

      <div className="bg-paper-1 p-4 flex flex-col gap-4">
        <Heading3 className="text-2xl border-b border-paper-2 pb-3">
          Summary
        </Heading3>
        <SummaryRow label="Contract">
          {contractLink ? (
            <a
              href={contractLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1"
            >
              {formatAddress(AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS)}
              <ArrowUpRightIcon className="text-primary-blue" size={24} />
            </a>
          ) : (
            <span>
              {formatAddress(AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS)}
            </span>
          )}
        </SummaryRow>
        <SummaryRow label="Round duration">
          <span className="font-bold">{intervalLabel}</span>
          <CalendarIcon className="text-blue-2" size={24} />
        </SummaryRow>
        <SummaryRow label="Automatic Deposit frequency">
          <span className="font-bold">
            {remainingRounds} {remainingRounds === 1 ? "round" : "rounds"}
          </span>
          <ArrowsClockwiseIcon className="text-blue-2" size={24} />
        </SummaryRow>
        <SummaryRow label={`${perRoundLabel} Deposit`}>
          <BreadAmount value={depositAmount} />
        </SummaryRow>
        <SummaryRow label="Total Deposit">
          <BreadAmount value={totalDeposit} highlighted />
        </SummaryRow>
        <Caption className="text-surface-grey">1 BREAD = 1 USD</Caption>
      </div>

      <Body className="text-center text-surface-grey">
        Once activated, your deposit will be sent automatically each round.
        We&apos;ll only move the exact amount required. You can turn this off
        anytime in settings.
      </Body>

      <div className="lifted-button-container">
        <LocalButton
          variant="positive"
          rightIcon={<HandDepositIcon />}
          onClick={onActivate}
        >
          Grant Permission and Activate
        </LocalButton>
      </div>
    </ModalContainer>
  );
};
