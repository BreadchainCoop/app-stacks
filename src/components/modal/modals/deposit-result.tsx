import {
  DepositLoadingModalState,
  DepositResultModalState,
  TModalStatus,
} from "../context";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { AutoDepositActivation } from "@/components/auto-deposit-activation";

const DepositResult = ({
  modalState,
}: {
  modalState: DepositResultModalState | DepositLoadingModalState;
}) => {
  const status: TModalStatus =
    modalState.type === "DEPOSIT_LOADING" ? "loading" : modalState.result;

  let title = "",
    msg = "";

  if (modalState.type === "DEPOSIT_LOADING") {
    title = "Depositing";
  } else {
    title = `Deposit ${
      modalState.result === "success" ? "successful" : "failed"
    }`;
    msg =
      modalState.result === "success"
        ? "Successfully paid"
        : modalState.msg || "Something went wrong. Please try again!";
  }

  return (
    <ModalContainer
      status={
        modalState.type === "DEPOSIT_LOADING" ? "loading" : modalState.result
      }
    >
      <ModalHeader title={title} />
      <ModalStatus status={status} msg={msg} />
      {modalState.type === "DEPOSIT_RESULT" &&
        modalState.result === "success" &&
        modalState.circleId !== undefined && (
          <AutoDepositActivation stackId={modalState.circleId.toString()} />
        )}
    </ModalContainer>
  );
};

export default DepositResult;
