import { ModalContainer, ModalHeader } from "../../components";
import FundWithConnectedWallet from "./fund-with-connected-wallet";
import FundWithLifi from "./fund-with-lifi";
import { FundWalletModalState, useModal } from "../../context";
import StacksBalance from "./stacks-balance";
import { useEffect, useState } from "react";
import { useWatchFundedXdai } from "@/hooks/use-watch-funded-xdai";
import { Body, useConnectedUser } from "@breadcoop/ui";
import Alert from "@/components/alert";
import { PeerIntentFulfilledResult } from "@zkp2p/sdk";

const FundWallet = ({ modalState }: { modalState: FundWalletModalState }) => {
  const [result, _setResult] = useState<PeerIntentFulfilledResult | null>(null);
  const { setModal } = useModal();
  const { user } = useConnectedUser();

  const [listenForXDaiConversion, setListenForXDaiConversion] = useState(false);

  const handleListerForXDai = (v: boolean) => setListenForXDaiConversion(v);

  const handleSkip = () => {
    setModal(null);
  };

  useWatchFundedXdai(
    listenForXDaiConversion && user.status === "CONNECTED"
      ? user.address
      : undefined,
    modalState.onFunded
  );

  useEffect(() => {
    return () => {
      handleListerForXDai(false);
    };
  }, []);

  return (
    <ModalContainer className="bg-[#FDFAF3]! border-paper-1! shadow-[0px_4px_12px_0px_#1B201A26] max-w-140.75!">
      <ModalHeader title={result ? "Peer Successful" : "Fund your account"} />
      <Body className="-mt-4">
        Send xDAI to your wallet and automatically get BREAD
      </Body>
      <div className={result ? "" : ""}>
        {result && (
          <div>
            <h1>Peer Onramp result:</h1>
            <p>{JSON.stringify(result, undefined, 2)}</p>
          </div>
        )}
      </div>
      <div className={result ? "h-0 overflow-hidden" : ""}>
        <StacksBalance address={modalState.address} />
        <FundWithConnectedWallet handleListerForXDai={handleListerForXDai} />
        <div className="*:mb-2">
          <FundWithLifi address={modalState.address} />
          {/* <FundWithPeer
            address={modalState.address}
            onFunded={modalState.onFunded}
            showSkipProcess={modalState.showSkipProcess}
            setResult={setResult}
          /> */}
        </div>
        <Alert
          variant="warning"
          title="IMPORTANT: Always get xDAI"
          description="The token you need to send to your wallet is xDAI from Gnosis chain."
          closeAble={false}
          descClassName="text-surface-ink text-left"
        />
        {modalState.showSkipProcess && (
          <button
            type="button"
            className="font-bold text-primary-blue mt-6"
            onClick={handleSkip}
          >
            Skip this process
          </button>
        )}
      </div>
    </ModalContainer>
  );
};

export default FundWallet;
