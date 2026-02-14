import { Body } from "@breadcoop/ui";
import {
  ModalCloseBtn,
  ModalContainer,
  ModalHeader,
  ModalStatus,
} from "../components";
import { StackFailedModalState, useModal } from "../context";
import LocalLiftedButton from "@/components/lifted-button";
import { useState } from "react";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { useQueryClient } from "@tanstack/react-query";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { encodeFunctionData } from "viem";

const StackFailed = ({ modalState }: { modalState: StackFailedModalState }) => {
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const queryClient = useQueryClient();
  const { setModal } = useModal();

  const [isDecommissioning, setIsDecommissioning] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error" | null;
    message: string | null;
  }>({ type: null, message: null });

  const handleDecommission = async () => {
    if (isDecommissioning) return;

    setFeedback({ type: null, message: null });
    setIsDecommissioning(true);

    try {
      const encodedData = encodeFunctionData({
        abi: savingCirclesAbi,
        functionName: "decommission",
        args: [modalState.id],
      });
      const { hash } = await sendSponsoredTransaction({
        to: SAVING_CIRCLES_CONTRACT_ADDRESS,
        data: encodedData,
      });

      await waitForTxReceipt(hash);
      queryClient.invalidateQueries({ queryKey: ["readContract"] });

      setFeedback({
        type: "success",
        message: "Stack successfully retired — funds returned!",
      });

      setTimeout(() => {
        setModal(null);
      }, 5000);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Decommission failed:", err);

      const errorMsg =
        err?.shortMessage ||
        err?.message ||
        "Failed to retire stack. Please try again.";

      setFeedback({
        type: "error",
        message: errorMsg,
      });
    } finally {
      setIsDecommissioning(false);
    }
  };

  const buttonText = isDecommissioning
    ? "Retiring stack..."
    : feedback.type === "error"
      ? "Try Again"
      : "Retire stack & Claim your deposited amount";

  return (
    <ModalContainer status="error">
      <ModalHeader title="Stack failed" />
      <ModalStatus status="error" statusMsg="Your Stack failed" />

      <div className="text-center px-4">
        <Body className="text-surface-grey mb-6">
          Hey, it looks like someone missed the deposit deadline.
        </Body>
        <Body className="text-surface-grey mb-8">
          Some members may have lost funds because of it. We recommend
          contacting your group for clarity.
        </Body>
      </div>

      <div className="px-4">
        <div className="text-center">
          {feedback.message && (
            <Body
              className={
                feedback.type === "success"
                  ? "text-system-green"
                  : "text-system-red"
              }
            >
              {feedback.message}
            </Body>
          )}
        </div>

        {feedback.type !== "success" && (
          <div className="mb-4">
            <LocalLiftedButton width="full" onClick={handleDecommission}>
              {buttonText}
            </LocalLiftedButton>
          </div>
        )}

        {!isDecommissioning && <ModalCloseBtn />}
      </div>
    </ModalContainer>
  );
};

export default StackFailed;
