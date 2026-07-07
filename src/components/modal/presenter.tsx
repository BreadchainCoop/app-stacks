"use client";
import * as Dialog from "@radix-ui/react-dialog";

import { useModal } from "./context";
import { forwardRef, Ref, useEffect, useState } from "react";
import DepositInitModal from "./modals/deposit-init";
import DepositResult from "./modals/deposit-result";
import ClaimModal from "./modals/claim";
import StackInitModal from "./modals/stack-init";
import {
  StackFailedResultModal,
  StackSuccessResultModal,
} from "./modals/stack-result";
import StackFailed from "./modals/stack-failed";
import WithdrawBreadModal from "./modals/withdraw-bread";
import WalletFundingStatusModal from "./modals/wallet-funding-status";
import ReminderModal from "@/components/reminder/modal";
import NewUserOnboarding from "./modals/new-user-onboarding";
import SetAliasModal from "./modals/set-alias";
import FundWallet from "./modals/fund-wallet/fund-wallet";
import LiFiSwapModal from "../lifi/swap-modal";
import InstallPeerModal from "../peer/install-modal";
import PeerOnrampModal from "./modals/fund-wallet/peer-onramp-modal";
import FundWithConnectedWalletModalAmount from "./modals/fund-wallet/fund-with-connected-wallet-modal-amount";
import StartStackWarningModal from "./modals/start-stack-warning";
import AutomaticClaimsModal from "./modals/automatic-claims";

const ModalPresenter = () => {
  const { modalState, setModal } = useModal();

  return (
    <Dialog.Root open={!!modalState} onOpenChange={() => setModal(null)}>
      <Dialog.Portal forceMount>
        {modalState && (
          <>
            <Dialog.Overlay forceMount asChild>
              <ModalOverlay />
            </Dialog.Overlay>
            <Dialog.Content
              forceMount
              className=""
              onInteractOutside={(e) => e.preventDefault()}
            >
              {modalState.type === "STACK_CREATION_INIT" && (
                <StackInitModal modalState={modalState} />
              )}
              {modalState.type === "STACK_CREATION_SUCCESS" && (
                <StackSuccessResultModal modalState={modalState} />
              )}
              {modalState.type === "STACK_CREATION_FAILED" && (
                <StackFailedResultModal modalState={modalState} />
              )}
              {modalState.type === "DEPOSIT_INIT" && (
                <DepositInitModal modalState={modalState} />
              )}
              {(modalState.type === "DEPOSIT_RESULT" ||
                modalState.type === "DEPOSIT_LOADING") && (
                <DepositResult modalState={modalState} />
              )}
              {(modalState.type === "CLAIM_LOADING" ||
                modalState.type === "CLAIM_RESULT") && (
                <ClaimModal modalState={modalState} />
              )}
              {modalState.type === "STACK_FAILED" && (
                <StackFailed modalState={modalState} />
              )}
              {modalState.type === "START_STACK_WARNING" && (
                <StartStackWarningModal modalState={modalState} />
              )}
              {modalState.type === "WITHDRAW_BREAD" && <WithdrawBreadModal />}
              {modalState.type === "NEW_USER_ONBOARDING" && (
                <NewUserOnboarding modalState={modalState} />
              )}
              {modalState.type === "SET_ALIAS" && (
                <SetAliasModal modalState={modalState} />
              )}
              {modalState.type === "FUND_WALLET" && (
                <FundWallet modalState={modalState} />
              )}
              {modalState.type === "WALLET_FUNDING_STATUS" && (
                <WalletFundingStatusModal
                  modalState={modalState}
                  key={modalState.status}
                />
              )}
              {modalState.type === "REMINDER" && (
                <ReminderModal modalState={modalState} />
              )}
              {modalState.type ===
                "FUND_WITH_CONNECTED_WALLET_MODAL_AMOUNT" && (
                <FundWithConnectedWalletModalAmount modalState={modalState} />
              )}
              {modalState.type === "LIFI_BRIDGE_SWAP" && (
                <LiFiSwapModal modalState={modalState} />
              )}
              {modalState.type === "PEER_ONRAMP_INSTALL" && (
                <InstallPeerModal modalState={modalState} />
              )}
              {modalState.type === "PEER_ONRAMP" && (
                <PeerOnrampModal modalState={modalState} />
              )}
              {modalState.type === "AUTOMATIC_CLAIMS" && (
                <AutomaticClaimsModal modalState={modalState} />
              )}
            </Dialog.Content>
          </>
        )}
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ModalOverlay = forwardRef((props, ref: Ref<HTMLDivElement>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div ref={ref} {...props}>
      <div
        className={`z-30 fixed top-0 bg-[#F0F0F0] dark:bg-neutral-900 h-screen w-screen
					transition-opacity duration-200 
					${isVisible ? "opacity-90 dark:opacity-70" : "opacity-0"}`}
      />
    </div>
  );
});

ModalOverlay.displayName = "ModalOverlay";

export default ModalPresenter;
