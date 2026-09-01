"use client";

import { Body } from "@breadcoop/ui";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { ClaimInitModalState, ClaimResultModalState } from "../context";
import Alert from "@/components/alert";
import { AutomaticDeposit } from "@/components/automatic-deposits/toggle";
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
              title="IMPORTANT: Secure your next deposits"
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
                    The next deposit window opens when the next round starts. To
                    avoid stack failure, activate automatic deposits and we
                    deposit for you in every upcoming round of this stack.
                  </Body>
                </>
              }
              variant="warning"
            />
            <AutomaticDeposit
              className="mt-0 border-t-0"
              stackId={modalState.circleId!.toString()}
              depositAmount={modalState.nextDeposit!}
              remainingRounds={Number(modalState.roundsLeft ?? BigInt(0))}
              depositInterval={modalState.depositInterval ?? BigInt(0)}
              tokenAddress={modalState.nextDepositAddress!}
            />
          </>
        )}
    </ModalContainer>
  );
};

export default ClaimModal;
