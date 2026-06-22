import { Body } from "@breadcoop/ui";
import {
  ModalCloseBtn,
  ModalContainer,
  ModalHeader,
  ModalStatus,
} from "../components";
import { StackFailedModalState, useModal } from "../context";
import LocalButton from "@/components/button";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSavingCirclesTx } from "@/hooks/use-saving-circles-tx";
import { parseContractError } from "@/utils/parse-contract-error";
import { DECOMMISSION_ERRORS } from "@/lib/contract-errors";

const parseDecommissionError = (error: unknown) =>
  parseContractError(
    error,
    DECOMMISSION_ERRORS,
    "Failed to retire stack. Please try again."
  );

const StackFailed = ({ modalState }: { modalState: StackFailedModalState }) => {
  const queryClient = useQueryClient();
  const { setModal } = useModal();
  const { sendSavingCirclesTx } = useSavingCirclesTx();

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
      await sendSavingCirclesTx({
        functionName: "decommission",
        args: [modalState.id],
      });
      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });

      setFeedback({
        type: "success",
        message: "Stack successfully retired — funds returned!",
      });
      setTimeout(() => setModal(null), 5000);
    } catch (err) {
      console.error("Decommission failed:", err);
      setFeedback({ type: "error", message: parseDecommissionError(err) });
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

        {feedback.type !== "success" &&
          feedback?.message?.toLowerCase() !== "this circle is not active." && (
            <div className="mb-4">
              <LocalButton className="w-full" onClick={handleDecommission}>
                {buttonText}
              </LocalButton>
            </div>
          )}

        {!isDecommissioning && <ModalCloseBtn />}
      </div>
    </ModalContainer>
  );
};

export default StackFailed;
