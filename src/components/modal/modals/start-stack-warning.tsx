import { Body, LiftedButton } from "@breadcoop/ui";
import { ModalContainer, ModalHeader } from "../components";
import { StartStackWarningModalState, useModal } from "../context";
import LocalLiftedButton from "@/components/lifted-button";

const StartStackWarningModal = ({
  modalState,
}: {
  modalState: StartStackWarningModalState;
}) => {
  const { setModal } = useModal();

  const startStack = () => {
    setModal(null);
    modalState.onConfirm();
  };

  return (
    <ModalContainer>
      <ModalHeader title="Start stack now?" />
      <Body className="text-center text-surface-grey">
        {modalState.pendingMembers === 1
          ? "1 invited member has not joined yet."
          : `${modalState.pendingMembers} invited members have not joined yet.`}{" "}
        Once the stack starts, no one else can join.
      </Body>
      <div className="flex flex-col gap-3">
        <LocalLiftedButton
          width="full"
          className="font-bold"
          onClick={startStack}
        >
          Start Stacks
        </LocalLiftedButton>
        <LiftedButton
          preset="burn"
          width="full"
          className="font-bold text-system-red"
          onClick={() => setModal(null)}
        >
          Cancel
        </LiftedButton>
      </div>
    </ModalContainer>
  );
};

export default StartStackWarningModal;
