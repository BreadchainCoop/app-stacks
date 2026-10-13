"use client";
import * as Dialog from "@radix-ui/react-dialog";
import dynamic from "next/dynamic";

import { useModal } from "./context";
import { forwardRef, Ref, useEffect, useState } from "react";
import { ModalContainer } from "./components";
import { CircularProgressIcon } from "../icons/circular-progress";

// The presenter is mounted by the root layout, so a static import here puts a
// modal's code in every page's first load. No modal is open on first paint, so
// each is loaded the first time it opens instead. This is what keeps the LI.FI
// widget (and the MUI it brings) out of the initial bundle.
const ModalLoading = () => (
  <ModalContainer>
    <CircularProgressIcon />
  </ModalContainer>
);

const DepositInitModal = dynamic(() => import("./modals/deposit-init"), {
  loading: ModalLoading,
});
const DepositResult = dynamic(() => import("./modals/deposit-result"), {
  loading: ModalLoading,
});
const ClaimModal = dynamic(() => import("./modals/claim"), {
  loading: ModalLoading,
});
const StackInitModal = dynamic(() => import("./modals/stack-init"), {
  loading: ModalLoading,
});
const StackSuccessResultModal = dynamic(
  () => import("./modals/stack-result").then((m) => m.StackSuccessResultModal),
  { loading: ModalLoading }
);
const StackFailedResultModal = dynamic(
  () => import("./modals/stack-result").then((m) => m.StackFailedResultModal),
  { loading: ModalLoading }
);
const StackFailed = dynamic(() => import("./modals/stack-failed"), {
  loading: ModalLoading,
});
const WithdrawBreadModal = dynamic(() => import("./modals/withdraw-bread"), {
  loading: ModalLoading,
});
const WalletFundingStatusModal = dynamic(
  () => import("./modals/wallet-funding-status"),
  { loading: ModalLoading }
);
const ReminderModal = dynamic(() => import("@/components/reminder/modal"), {
  loading: ModalLoading,
});
const NewUserOnboarding = dynamic(
  () => import("./modals/new-user-onboarding"),
  { loading: ModalLoading }
);
const SetAliasModal = dynamic(() => import("./modals/set-alias"), {
  loading: ModalLoading,
});
const FundWallet = dynamic(() => import("./modals/fund-wallet/fund-wallet"), {
  loading: ModalLoading,
});
const LiFiSwapModal = dynamic(() => import("../lifi/swap-modal"), {
  loading: ModalLoading,
});
const InstallPeerModal = dynamic(() => import("../peer/install-modal"), {
  loading: ModalLoading,
});
const FundWithConnectedWalletModalAmount = dynamic(
  () => import("./modals/fund-wallet/fund-with-connected-wallet-modal-amount"),
  { loading: ModalLoading }
);
const StartStackWarningModal = dynamic(
  () => import("./modals/start-stack-warning"),
  { loading: ModalLoading }
);
const AutomaticClaimsModal = dynamic(
  () => import("./modals/automatic-claims"),
  {
    loading: ModalLoading,
  }
);
const VisitorOnboarding = dynamic(
  () => import("../onboard/visitor-onboard-modal"),
  { loading: ModalLoading }
);
const AutomaticDepositsModal = dynamic(
  () => import("@/components/automatic-deposits/modal"),
  { loading: ModalLoading }
);
const RemoveMemberWarningModal = dynamic(
  () => import("./modals/remove-member-warning"),
  { loading: ModalLoading }
);
const MigrateAndTransferModal = dynamic(
  () => import("./modals/migrate-and-transfer"),
  { loading: ModalLoading }
);
const GoalInitModal = dynamic(() => import("./modals/goal-init"), {
  loading: ModalLoading,
});
const GoalSuccessResultModal = dynamic(
  () => import("./modals/goal-result").then((m) => m.GoalSuccessResultModal),
  { loading: ModalLoading }
);
const GoalFailedResultModal = dynamic(
  () => import("./modals/goal-result").then((m) => m.GoalFailedResultModal),
  { loading: ModalLoading }
);
const StackTxInitModal = dynamic(
  () => import("./modals/stack-tx").then((m) => m.StackTxInitModal),
  { loading: ModalLoading }
);
const StackTxStatusModal = dynamic(
  () => import("./modals/stack-tx").then((m) => m.StackTxStatusModal),
  { loading: ModalLoading }
);

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
              {modalState.type === "AUTOMATIC_CLAIMS" && (
                <AutomaticClaimsModal modalState={modalState} />
              )}
              {modalState.type === "VISITOR_ONBOARDING" && (
                <VisitorOnboarding />
              )}
              {modalState.type === "AUTOMATIC_DEPOSITS" && (
                <AutomaticDepositsModal modalState={modalState} />
              )}
              {modalState.type === "REMOVE_MEMBER_WARNING" && (
                <RemoveMemberWarningModal modalState={modalState} />
              )}
              {modalState.type === "MIGRATE_AND_TRANSFER" && (
                <MigrateAndTransferModal modalState={modalState} />
              )}
              {modalState.type === "GOAL_CREATION_INIT" && (
                <GoalInitModal modalState={modalState} />
              )}
              {modalState.type === "GOAL_CREATION_SUCCESS" && (
                <GoalSuccessResultModal modalState={modalState} />
              )}
              {modalState.type === "GOAL_CREATION_FAILED" && (
                <GoalFailedResultModal modalState={modalState} />
              )}
              {modalState.type === "STACK_TX_INIT" && (
                <StackTxInitModal modalState={modalState} />
              )}
              {(modalState.type === "STACK_TX_LOADING" ||
                modalState.type === "STACK_TX_RESULT") && (
                <StackTxStatusModal modalState={modalState} />
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
