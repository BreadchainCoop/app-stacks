import { Body } from "@breadcoop/ui";
import { ModalContainer, ModalHeader } from "../components";
import { StartStackWarningModalState, useModal } from "../context";
import LocalButton from "@/components/button";

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
        <LocalButton className="font-bold w-full" onClick={startStack}>
          Start Stacks
        </LocalButton>
        <LocalButton
          variant="destructive"
          className="font-bold w-full"
          onClick={() => setModal(null)}
        >
          Cancel
        </LocalButton>
      </div>
    </ModalContainer>
  );
};

export default StartStackWarningModal;
