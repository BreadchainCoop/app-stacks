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
import WalletFundingModal from "./modals/wallet-funding";
import WalletFundingStatusModal from "./modals/wallet-funding-status";
import ReminderModal from "@/components/reminder/modal";

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
              {modalState.type === "WITHDRAW_BREAD" && <WithdrawBreadModal />}
              {modalState.type === "WALLET_FUNDING" && (
                <WalletFundingModal modalState={modalState} />
              )}
              {modalState.type === "WALLET_FUNDING_STATUS" && (
                <WalletFundingStatusModal modalState={modalState} />
              )}
              {modalState.type === "REMINDER" && (
                <ReminderModal modalState={modalState} />
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
