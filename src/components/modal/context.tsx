"use client";

import { CalendarEvent } from "@/components/reminder/interfaces";
import {
  type ReactNode,
  RefObject,
  createContext,
  useContext,
  useState,
} from "react";
import { PeerExtensionSdk } from "@zkp2p/sdk";
import { Address } from "viem";
import { FundWithConnectedWalletModalAmountModalState } from "./modals/fund-wallet/fund-with-connected-wallet-modal-amount";
import { AutomaticClaimsModalState } from "./modals/automatic-claims";
import type { AutomaticDepositsModalState } from "@/components/automatic-deposits/types";

export type TModalStatus = "loading" | "success" | "error";

export type StackInitModalState = {
  type: "STACK_CREATION_INIT";
  name: string;
  status: "awaiting" | "approved" | "successful";
};

export type StackInitSuccessModalState = {
  type: "STACK_CREATION_SUCCESS";
  // TODO: Create a circle interface and inherit from it
  circle: {
    name: string;
    id: string;
    duration: string;
    deposit: number;
    total: number;
    members: number;
  };
};

export type StackInitFailedModalState = {
  type: "STACK_CREATION_FAILED";
  msg?: string;
};

export type DepositInitModalState = {
  type: "DEPOSIT_INIT";
  amount: bigint;
  tokenAddress: Address;
  circleId: bigint;
};

export type DepositLoadingModalState = {
  type: "DEPOSIT_LOADING";
};

export type DepositResultModalState = {
  type: "DEPOSIT_RESULT";
  result: "success" | "error";
  msg?: string;
  amount?: number;
};

export type ClaimInitModalState = {
  type: "CLAIM_LOADING";
  msg?: string;
};

export type ClaimResultModalState = {
  type: "CLAIM_RESULT";
  result: "success" | "error";
  msg?: string;
  amount?: number;
  nextDeposit?: bigint;
  roundsLeft?: bigint;
  nextDepositAddress?: Address;
  circleId?: bigint;
};

export type StackFailedModalState = {
  type: "STACK_FAILED";
  id: bigint;
};

export type StartStackWarningModalState = {
  type: "START_STACK_WARNING";
  pendingMembers: number;
  onConfirm: () => void;
};

export type WithdrawBreadModalState = {
  type: "WITHDRAW_BREAD";
};

export type NewUserOnboardingModalState = {
  type: "NEW_USER_ONBOARDING";
  fundingStatus: "idle" | "loading" | "success" | "error";
};

export type SetAliasModalState = {
  type: "SET_ALIAS";
  skippable?: boolean;
  onDone?: () => void;
};

export type FundWalletModalState = {
  type: "FUND_WALLET";
  address: Address;
  onFunded?: (newBalance: bigint, prevBalance: bigint) => Promise<void> | void;
  showSkipProcess?: boolean;
};

export type WalletFundingStatusModalState = {
  type: "WALLET_FUNDING_STATUS";
} & (
  | {
      status: "loading";
    }
  | { status: "error"; onRetry?: () => Promise<void> }
  | { status: "success"; breadAmount: string }
);

export type ReminderModalState = {
  type: "REMINDER";
  calendar: CalendarEvent;
};

export type LiFiBridgeSwapModalState = {
  type: "LIFI_BRIDGE_SWAP";
  address: Address;
};

export type PeerOnRampInstallModalState = {
  type: "PEER_ONRAMP_INSTALL";
  peerSdkRef: RefObject<PeerExtensionSdk | null>;
  fundWalletModalState: Omit<FundWalletModalState, "type">;
};

export type VisitorOnboardingModalState = {
  type: "VISITOR_ONBOARDING";
};

export type SavingsGoalsModalState = {
  type: "SAVINGS_GOALS";
  privyUserId: string;
  showFundingNext?: boolean;
};

export type ModalState =
  | DepositInitModalState
  | DepositLoadingModalState
  | DepositResultModalState
  | ClaimInitModalState
  | ClaimResultModalState
  | StackInitModalState
  | StackInitSuccessModalState
  | StackInitFailedModalState
  | StackFailedModalState
  | StartStackWarningModalState
  | WithdrawBreadModalState
  | WalletFundingStatusModalState
  | ReminderModalState
  | NewUserOnboardingModalState
  | SetAliasModalState
  | FundWalletModalState
  | LiFiBridgeSwapModalState
  | PeerOnRampInstallModalState
  | FundWithConnectedWalletModalAmountModalState
  | AutomaticClaimsModalState
  | VisitorOnboardingModalState
  | AutomaticDepositsModalState
  | SavingsGoalsModalState
  | null;

export type ModalContext = {
  modalState: ModalState;
  setModal: (modalState: ModalState) => void;
};

const ModalContext = createContext<ModalContext>({
  modalState: null,
  setModal() {},
});

function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>(null);

  function setModal(modalState: ModalState) {
    setModalState(modalState);
  }

  return (
    <ModalContext.Provider value={{ modalState, setModal }}>
      {children}
    </ModalContext.Provider>
  );
}

const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};

export { ModalProvider, useModal };
