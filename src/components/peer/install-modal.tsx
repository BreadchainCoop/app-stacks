import { Body } from "@breadcoop/ui";
import { ModalContainer, ModalHeader } from "../modal/components";
import { PeerOnRampInstallModalState, useModal } from "../modal/context";

const InstallPeerModal = ({
  modalState,
}: {
  modalState: PeerOnRampInstallModalState;
}) => {
  const { setModal } = useModal();
  const handleInstallClick = () => {
    const sdk = modalState.peerSdkRef.current;
    if (sdk) sdk.openInstallPage();
  };

  const close = () => {
    setModal({ type: "FUND_WALLET", ...modalState.fundWalletModalState });
  };

  return (
    <ModalContainer>
      <ModalHeader title="Install Peer" showCloseIcon={false} />
      <Body>
        A funding wallet that lets you go from fiat to crypto in seconds,
        without additional verification.
      </Body>
      <button onClick={handleInstallClick} className="text-primary-blue">
        Install Extension
      </button>
      <button onClick={close} className="text-system-red">
        Close
      </button>
    </ModalContainer>
  );
};

export default InstallPeerModal;
