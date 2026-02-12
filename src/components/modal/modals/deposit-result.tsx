import {
  DepositLoadingModalState,
  DepositResultModalState,
  TModalStatus,
} from "../context";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";

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
        : "Something went wrong. Please try again!";
  }

  return (
    <ModalContainer
      // status={modalState.result}
      status={
        modalState.type === "DEPOSIT_LOADING" ? "loading" : modalState.result
      }
      // className={`border ${
      // 	modalState.result === "success"
      // 		? "border-system-green"
      // 		: "border-system-red"
      // }`}
    >
      <ModalHeader title={title} />
      <ModalStatus status={status} msg={msg} />
      {/* <div className="flex items-center justify-center flex-col gap-2">
				{modalState.result === "success" ? (
					<>
						<CheckCircleIcon
							size={48}
							className="fill-system-green"
						/>
						<Body bold className="text-system-green">
							Complete
						</Body>
						<Body bold className="text-surface-grey">
							Successfully unlocked!
						</Body>
					</>
				) : (
					<>
						<WarningCircleIcon
							size={48}
							className="fill-system-red"
						/>
						<Body bold className="text-system-red">
							{modalState.msg}
						</Body>
						<Body bold className="text-surface-grey">
							Something went wrong. Please try again!
						</Body>
					</>
				)}
			</div> */}
      {/* {modalState.result === "error" && (
				<DepositButton preset="burn" width="full" label="Try again" />
			)} */}
    </ModalContainer>
  );
};

export default DepositResult;
