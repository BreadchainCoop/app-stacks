"use client";

import { Body } from "@breadcoop/ui";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { ClaimInitModalState, ClaimResultModalState } from "../context";
import Alert from "@/components/alert";
import DepositButton from "@/components/deposit-button";
import { DEPOSIT_TOKEN, formatDepositAmount } from "@/lib/deposit-token";
import LocalButton from "@/components/button";

const ClaimModal = ({
  modalState,
}: {
  modalState: ClaimInitModalState | ClaimResultModalState;
}) => {
  let status: "loading" | "error" | "success" = "loading";
  let title = "";
  let msg = "";

  if (modalState.type === "CLAIM_LOADING") {
    status = "loading";
    title = "Claiming Deposit";
  } else {
    status = modalState.result;
    if (modalState.result === "error") {
      title = "Claim failed!";
      msg = modalState.msg || "Something went wrong. Please try again!";
    } else {
      title = "Claim successful";
      msg = "Successfully unlocked!";
    }
  }

  return (
    <ModalContainer status={status}>
      <ModalHeader title={title} />
      <ModalStatus status={status} msg={msg} />
      {modalState.type !== "CLAIM_LOADING" && modalState.result === "error" && (
        <LocalButton className="w-full" variant="burn">
          Try Again
        </LocalButton>
      )}
      {modalState.type === "CLAIM_RESULT" &&
        Boolean(modalState.nextDeposit) && (
          <>
            <Alert
              className="-mt-4"
              closeAble={false}
              title="IMPORTANT: Secure next deposit"
              description={
                <>
                  <Body>
                    <span className="font-bold">{modalState.roundsLeft} </span>
                    {modalState.roundsLeft === BigInt(1)
                      ? "round"
                      : "rounds"}{" "}
                    remain.
                  </Body>
                  <Body>
                    To avoid stack failure, deposit for the next round.
                  </Body>
                </>
              }
              variant="warning"
            />
            <DepositButton
              className="font-bold w-full"
              label={`Deposit ${formatDepositAmount(modalState.nextDeposit!)} ${DEPOSIT_TOKEN.symbol}`}
              amount={modalState.nextDeposit!}
              tokenAddress={modalState.nextDepositAddress!}
              circleId={modalState.circleId!}
            />
          </>
        )}
    </ModalContainer>
  );
};

export default ClaimModal;
