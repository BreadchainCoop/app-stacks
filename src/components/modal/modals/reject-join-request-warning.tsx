import { Body } from "@breadcoop/ui";
import { ModalContainer, ModalHeader } from "../components";
import { RejectJoinRequestWarningModalState, useModal } from "../context";
import LocalButton from "@/components/button";

const RejectJoinRequestWarningModal = ({
  modalState,
}: {
  modalState: RejectJoinRequestWarningModalState;
}) => {
  const { setModal } = useModal();

  const reject = () => {
    setModal(null);
    modalState.onConfirm();
  };

  return (
    <ModalContainer>
      <ModalHeader title="Reject this request?" />
      <Body className="text-center text-surface-grey">
        This person will not be able to join the stack unless they request to
        join again.
      </Body>
      <div className="flex flex-col gap-3">
        <LocalButton
          variant="destructive"
          className="font-bold w-full"
          onClick={reject}
        >
          Reject request
        </LocalButton>
        <LocalButton
          className="font-bold w-full"
          onClick={() => setModal(null)}
        >
          Cancel
        </LocalButton>
      </div>
    </ModalContainer>
  );
};

export default RejectJoinRequestWarningModal;
