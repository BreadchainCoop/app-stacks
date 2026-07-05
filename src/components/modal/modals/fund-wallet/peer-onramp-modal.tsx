"use client";

import { useState } from "react";
import { Body } from "@breadcoop/ui";
import { Label } from "@/components/label";
import NumericInput from "@/components/numeric-input";
import LocalButton from "@/components/button";
import Loading from "@/app/loading";
import { ModalContainer, ModalHeader } from "../../components";
import { PeerOnrampModalState, useModal } from "../../context";
import {
  PEER_PLATFORMS,
  PEER_PLATFORM_CONFIG,
  PeerPlatform,
  usePeerOnramp,
} from "@/hooks/use-peer-onramp";

const PeerOnrampModal = ({
  modalState,
}: {
  modalState: PeerOnrampModalState;
}) => {
  const { setModal } = useModal();
  const address = modalState.fundWalletModalState.address;

  const [platform, setPlatform] = useState<PeerPlatform>("wise");
  const [currency, setCurrency] = useState("USD");
  const [amount, setAmount] = useState("");

  const { stepState, startOnramp, confirmPaid, reset } = usePeerOnramp(
    address,
    async ({ prevBalance, newBalance, breadAmount }) => {
      setModal({
        type: "WALLET_FUNDING_STATUS",
        status: "success",
        breadAmount,
      });
      await modalState.fundWalletModalState.onFunded?.(newBalance, prevBalance);
    }
  );

  const goBack = () => {
    reset();
    setModal({ type: "FUND_WALLET", ...modalState.fundWalletModalState });
  };

  const selectPlatform = (p: PeerPlatform) => {
    setPlatform(p);
    if (!PEER_PLATFORM_CONFIG[p].currencies.includes(currency)) {
      setCurrency(PEER_PLATFORM_CONFIG[p].currencies[0]);
    }
  };

  const amountInvalid = !amount || Number(amount) <= 0;

  return (
    <ModalContainer>
      <div className="flex items-center justify-between">
        <ModalHeader title="Deposit with Peer" showCloseIcon={false} />
        {(stepState.step === "form" ||
          stepState.step === "awaiting_payment") && (
          <button
            type="button"
            onClick={goBack}
            className="inline-block text-primary-blue font-semibold ml-auto cursor-pointer max-w-max"
          >
            Back
          </button>
        )}
      </div>

      {stepState.step === "form" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (amountInvalid) return;
            startOnramp({ platform, currency, fiatAmount: amount });
          }}
        >
          {stepState.error && (
            <Body className="text-system-red mb-4">{stepState.error}</Body>
          )}
          <Label>Pay with</Label>
          <div className="flex gap-2 mb-4">
            {PEER_PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => selectPlatform(p)}
                className={`flex-1 border py-2 font-bold transition-colors cursor-pointer ${
                  platform === p
                    ? "border-primary-blue text-primary-blue bg-paper-1"
                    : "border-paper-2 text-surface-grey"
                }`}
              >
                {PEER_PLATFORM_CONFIG[p].label}
              </button>
            ))}
          </div>
          <Label>Currency</Label>
          <div className="flex gap-2 mb-4">
            {PEER_PLATFORM_CONFIG[platform].currencies.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={`flex-1 border py-2 font-bold transition-colors cursor-pointer ${
                  currency === c
                    ? "border-primary-blue text-primary-blue bg-paper-1"
                    : "border-paper-2 text-surface-grey"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Label htmlFor="peerFiatAmount">Amount ({currency})</Label>
          <NumericInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            name="peerFiatAmount"
            id="peerFiatAmount"
            className="w-full"
            allowDecimal
          />
          <div className="lifted-button-container mt-6">
            <LocalButton
              disabled={amountInvalid}
              className={amountInvalid ? "bg-surface-grey text-paper-main" : ""}
              type="submit"
            >
              Continue
            </LocalButton>
          </div>
        </form>
      )}

      {(stepState.step === "quoting" || stepState.step === "signaling") && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Loading />
          <Body className="text-center">
            {stepState.step === "quoting"
              ? "Finding the best rate..."
              : "Reserving your order..."}
          </Body>
        </div>
      )}

      {stepState.step === "awaiting_payment" && (
        <div>
          <Body className="mb-4">
            Send{" "}
            <strong>
              {stepState.quote.fiatAmountFormatted} {stepState.quote.currency}
            </strong>{" "}
            with {PEER_PLATFORM_CONFIG[stepState.quote.platform].label} to:
          </Body>
          <Body
            bold
            className="border border-paper-2 py-3 px-4 bg-paper-1 mb-4"
          >
            {stepState.quote.payeeHandle || "See your payment app"}
          </Body>
          <Body className="text-sm text-surface-grey mb-6">
            You will receive ~{stepState.quote.tokenAmountFormatted} USDC,
            automatically converted to xDAI and baked into BREAD. Send exactly
            the amount shown, then confirm below.
          </Body>
          <div className="lifted-button-container">
            <LocalButton onClick={confirmPaid} type="button">
              I&apos;ve sent the payment
            </LocalButton>
          </div>
        </div>
      )}

      {stepState.step === "capturing" && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Loading />
          <Body className="text-center">
            Complete the verification in the Peer extension window. It signs in
            to {PEER_PLATFORM_CONFIG[stepState.quote.platform].label} to confirm
            your payment.
          </Body>
        </div>
      )}

      {(stepState.step === "fulfilling" ||
        stepState.step === "bridging" ||
        stepState.step === "minting" ||
        stepState.step === "done") && (
        <div className="flex flex-col items-center gap-4 py-6">
          <Loading />
          <Body className="text-center">
            {stepState.step === "fulfilling" && "Verifying your payment..."}
            {stepState.step === "bridging" &&
              "Payment verified! Bridging your funds to Gnosis - this usually takes a few minutes. Keep this window open."}
            {stepState.step === "minting" && "Baking your BREAD..."}
            {stepState.step === "done" &&
              `Done! ${stepState.breadAmount} BREAD baked.`}
          </Body>
        </div>
      )}
    </ModalContainer>
  );
};

export default PeerOnrampModal;
