"use client";

import { useModal } from "@/components/modal/context";
import { useState } from "react";
import { useAutomaticDeposits } from "../use-automatic-deposits";
import { AutomaticDepositsModalState } from "../types";
import { DeactivateConfirmState } from "./states/deactivate-confirm";
import { GeneralErrorState } from "./states/general-error";
import { InsufficientBalanceState } from "./states/insufficient-balance";
import { IntroState } from "./states/intro";
import { LoadingState } from "./states/loading";
import { SummaryState } from "./states/summary";
import { SuccessState } from "./states/success";

const AutomaticDepositsModal = ({
  modalState,
}: {
  modalState: AutomaticDepositsModalState;
}) => {
  const {
    stackId,
    currentValue,
    depositAmount,
    remainingRounds,
    depositInterval,
    tokenAddress,
    address,
    balance,
  } = modalState;

  const modal = useModal();
  const { activate, deactivate, status, setStatus } =
    useAutomaticDeposits(stackId);

  const enabling = !currentValue;
  const [step, setStep] = useState<"intro" | "summary">("intro");
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  const totalDeposit = depositAmount * BigInt(Math.max(0, remainingRounds));
  const missing = totalDeposit > balance ? totalDeposit - balance : BigInt(0);

  const closeModal = () => modal.setModal(null);

  const grantAndActivate = () => {
    if (balance < totalDeposit) {
      setInsufficientBalance(true);
      setStatus("error");
      return;
    }

    setInsufficientBalance(false);
    activate({ tokenAddress, allowanceAmount: totalDeposit });
  };

  if (status === "loading") return <LoadingState onClose={closeModal} />;

  if (status === "success")
    return <SuccessState enabling={enabling} onClose={closeModal} />;

  if (status === "error" && insufficientBalance)
    return (
      <InsufficientBalanceState
        required={totalDeposit}
        balance={balance}
        missing={missing}
        onClose={closeModal}
        onFundWallet={() => modal.setModal({ type: "FUND_WALLET", address })}
      />
    );

  if (status === "error")
    return (
      <GeneralErrorState
        onTryAgain={() => {
          setInsufficientBalance(false);
          setStatus("idle");
          setStep("summary");
        }}
      />
    );

  if (!enabling)
    return (
      <DeactivateConfirmState
        onClose={closeModal}
        onDeactivate={() => deactivate()}
      />
    );

  if (step === "intro")
    return (
      <IntroState onClose={closeModal} onContinue={() => setStep("summary")} />
    );

  return (
    <SummaryState
      depositAmount={depositAmount}
      remainingRounds={remainingRounds}
      depositInterval={depositInterval}
      totalDeposit={totalDeposit}
      onClose={closeModal}
      onActivate={grantAndActivate}
    />
  );
};

export default AutomaticDepositsModal;
