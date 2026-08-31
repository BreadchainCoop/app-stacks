"use client";

import { useState } from "react";
import { ModalContainer, ModalHeader, ModalStatus } from "../components";
import { MigrateAndTransferModalState, useModal } from "../context";
import {
  Body,
  formatBalance,
  FormattedDecimalNumber,
  Logo,
} from "@breadcoop/ui";
import { erc20Abi, formatEther } from "viem";
import { usePrivy } from "@privy-io/react-auth";
import LocalButton from "@/components/button";
import BreadInfoNote from "@/components/bread-info-note";
import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { useEmbeddedWalletBalances } from "@/hooks/use-embedded-wallet-balances";
import { useSimulateAndSponsorTx } from "@/hooks/use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { useInvalidateHasTransferredToWallet } from "@/hooks/use-has-transferred-to-wallet";
import { parseContractError } from "@/utils/parse-contract-error";
import { formatAddress } from "@/utils/address";

const parseTransferError = (error: unknown) =>
  parseContractError(
    error,
    { ERC20InsufficientBalance: "Insufficient BREAD balance." },
    "Something went wrong during the transfer."
  );

const MigrateAndTransferModal = ({
  modalState,
}: {
  modalState: MigrateAndTransferModalState;
}) => {
  const { embeddedAddress, externalAddress } = modalState;
  const { setModal } = useModal();
  const { user: privyUser } = usePrivy();
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const invalidateHasTransferred = useInvalidateHasTransferredToWallet();

  const [level, setLevel] = useState<"form" | "running" | "done">("form");
  const [transferStatus, setTransferStatus] = useState<
    "pending" | "running" | "success" | "error"
  >("pending");
  const [transferError, setTransferError] = useState<string | null>(null);
  const [sentAmounts, setSentAmounts] = useState({ bread: "0", xdai: "0" });

  const {
    breadBalance,
    xdaiBalance,
    isLoading: isLoadingBalances,
    hasFunds,
  } = useEmbeddedWalletBalances(embeddedAddress);

  const runTransfer = async () => {
    setLevel("running");
    setTransferStatus("running");

    let transferSucceeded = false;

    try {
      if (breadBalance && breadBalance.value > BigInt(0)) {
        await simulateAndSponsorTx({
          address: BREAD_TOKEN_ADDRESS,
          abi: erc20Abi,
          functionName: "transfer",
          args: [externalAddress, breadBalance.value],
          account: embeddedAddress,
          options: {
            address: embeddedAddress,
            uiOptions: { showWalletUIs: false },
          },
        });
      }

      if (xdaiBalance && xdaiBalance.value > BigInt(0)) {
        const { hash } = await sendSponsoredTransaction(
          {
            to: externalAddress,
            value: xdaiBalance.value,
          },
          {
            address: embeddedAddress,
            uiOptions: { showWalletUIs: false },
          }
        );
        await waitForTxReceipt(hash);
      }

      setSentAmounts({
        bread: breadBalance ? formatEther(breadBalance.value) : "0",
        xdai: xdaiBalance ? formatEther(xdaiBalance.value) : "0",
      });
      setTransferStatus("success");
      transferSucceeded = true;
    } catch (error) {
      console.error("Transfer to external wallet error", error);
      setTransferStatus("error");
      setTransferError(parseTransferError(error));
    }

    // Only now — once funds have actually moved on-chain — point
    // wallet_address at the linked wallet, so alias/dashboard lookups keep
    // resolving to the old address until a transfer actually succeeds.
    if (privyUser?.id && transferSucceeded) {
      fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          privyUserId: privyUser.id,
          walletAddress: externalAddress,
          markTransferred: true,
        }),
      })
        .then(() => invalidateHasTransferred(privyUser.id))
        .catch((err) => console.error("Failed to update user record:", err));
    }

    setLevel("done");
  };

  return (
    <ModalContainer className="max-w-142!">
      <ModalHeader title="Transfer to your linked wallet" />
      {level === "done" ? (
        <div className="flex flex-col items-center gap-2">
          <ModalStatus
            status={transferStatus === "error" ? "error" : "success"}
            statusMsg={
              transferStatus === "error" ? "Transfer incomplete" : "All done"
            }
          />
          {transferStatus === "success" && (
            <div className="flex flex-col items-center gap-2 mt-2">
              {sentAmounts.bread !== "0" && (
                <Body
                  bold
                  className="flex items-center justify-center border border-paper-2 p-1 gap-2"
                >
                  <Logo size={24} variant="square" />{" "}
                  <FormattedDecimalNumber
                    value={sentAmounts.bread}
                    integralPartClassName="text-base"
                    decimalPartClassName="text-xs"
                  />{" "}
                  <span>BREAD</span>
                </Body>
              )}
              {sentAmounts.xdai !== "0" && (
                <Body bold className="border border-paper-2 p-1">
                  {formatBalance(+sentAmounts.xdai, 4)} xDAI
                </Body>
              )}
            </div>
          )}
          {transferStatus === "error" && (
            <Body className="text-system-red text-center mt-2">
              {transferError ?? "Failed to transfer funds."}
            </Body>
          )}
          <Body className="border border-paper-2 py-3 px-4 bg-paper-1 mb-4 mt-2">
            {formatAddress(externalAddress)}
          </Body>
          <div className="w-full">
            <LocalButton
              onClick={() =>
                transferStatus === "success" ? setModal(null) : setLevel("form")
              }
              className="w-full"
            >
              {transferStatus === "error" ? "Try Again" : "Close"}
            </LocalButton>
          </div>
        </div>
      ) : (
        <div className="*:mb-6">
          <BreadInfoNote>
            We want you to stay in control of your funds on your own wallet —
            this moves any BREAD or xDAI sitting in your app wallet to your
            linked wallet below.
          </BreadInfoNote>
          <div>
            <Body className="text-surface-grey text-sm mb-1">To</Body>
            <Body className="border border-paper-2 py-3 px-4 bg-paper-1">
              {formatAddress(externalAddress)}
            </Body>
          </div>
          {(isLoadingBalances || hasFunds) && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Body className="text-surface-grey">BREAD</Body>
                <Body bold>
                  {isLoadingBalances
                    ? "Loading..."
                    : `${formatBalance(
                        +formatEther(breadBalance?.value ?? BigInt(0)),
                        2
                      )} BREAD`}
                </Body>
              </div>
              <div className="flex items-center justify-between">
                <Body className="text-surface-grey">xDAI</Body>
                <Body bold>
                  {isLoadingBalances
                    ? "Loading..."
                    : `${formatBalance(
                        +formatEther(xdaiBalance?.value ?? BigInt(0)),
                        4
                      )} xDAI`}
                </Body>
              </div>
            </div>
          )}
          <LocalButton
            onClick={runTransfer}
            disabled={isLoadingBalances || level === "running"}
            isLoading={level === "running"}
            className="w-full"
          >
            Transfer funds
          </LocalButton>
        </div>
      )}
    </ModalContainer>
  );
};

export default MigrateAndTransferModal;
