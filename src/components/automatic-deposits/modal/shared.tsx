"use client";

import { ModalCloseIcon } from "@/components/modal/components";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import {
  formatSecondsHuman,
  getIntervalBySeconds,
} from "@/utils/deposit-interval";
import { formatAmount } from "@/utils/format-amount";
import { networks } from "@/utils/network";
import { Body, Logo } from "@breadcoop/ui";
import { ReactNode } from "react";
import { formatEther } from "viem";

export const breadLabel = (value: bigint) =>
  `${formatAmount(Number(formatEther(value)), 2)} BREAD`;

export const getIntervalLabels = (depositInterval: bigint) => {
  const seconds = Number(depositInterval);
  const intervalLabel =
    getIntervalBySeconds(seconds)?.label ?? formatSecondsHuman(seconds);
  const perRoundLabel = intervalLabel.endsWith("ly")
    ? intervalLabel.slice(0, -2)
    : intervalLabel;

  return { intervalLabel, perRoundLabel };
};

export const automaticContractExplorerLink = () => {
  const explorerBase =
    networks[getDefaultChainId() as keyof typeof networks]?.explorerUrl;

  return explorerBase
    ? `${explorerBase}/${AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS}`
    : undefined;
};

/**
 * Right-aligned close button. ModalContainer forces direct children to
 * full width (`*:w-full`), so the icon is pushed to the right with flex.
 */
export const ModalClose = ({ onClick }: { onClick: () => void }) => (
  <button type="button" onClick={onClick} className="flex justify-end">
    <ModalCloseIcon />
  </button>
);

export const BreadAmount = ({
  value,
  highlighted,
}: {
  value: bigint;
  highlighted?: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1 px-2 py-1 ${
      highlighted ? "border border-system-green" : ""
    }`}
  >
    <Logo size={18} variant="square" />
    <span className="font-bold">{breadLabel(value)}</span>
  </span>
);

export const SummaryRow = ({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: ReactNode;
  children: ReactNode;
}) => (
  <div className="flex items-center justify-between gap-2">
    <Body className="flex items-center gap-1 text-surface-grey">
      {label}
      {hint}
    </Body>
    <div className="flex items-center gap-1 text-surface-ink">{children}</div>
  </div>
);
