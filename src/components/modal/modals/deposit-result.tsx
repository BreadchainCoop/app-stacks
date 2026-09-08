import {
  DepositLoadingModalState,
  DepositResultModalState,
  TModalStatus,
} from "../context";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { AutomaticDepositsPrompt } from "@/components/automatic-deposits/activation-prompt";
import LocalButton from "@/components/button";
import { useIsMiniPay } from "@/components/providers/is-minipay";
import { MINIPAY_ADD_CASH_URL } from "@/utils/minipay";

const DepositResult = ({
  modalState,
}: {
  modalState: DepositResultModalState | DepositLoadingModalState;
}) => {
  const isMiniPay = useIsMiniPay();
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
          <AutomaticDepositsPrompt
            circleId={modalState.circleId}
            context="post-deposit"
          />
        )}
      {isMiniPay &&
        modalState.type === "DEPOSIT_RESULT" &&
        modalState.insufficientBalance && (
          <LocalButton
            as="a"
            href={MINIPAY_ADD_CASH_URL}
            className="w-full font-bold"
          >
            Deposit funds
          </LocalButton>
        )}
    </ModalContainer>
  );
};

export default DepositResult;
