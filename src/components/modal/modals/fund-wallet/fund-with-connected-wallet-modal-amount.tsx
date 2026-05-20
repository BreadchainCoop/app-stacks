"use client";

import { Label } from "@/components/label";
import NumericInput from "@/components/numeric-input";
import { useEffect, useState } from "react";
import { ModalContainer, ModalHeader } from "../../components";
import LocalLiftedButton from "@/components/lifted-button";
import { Body, formatBalance, useConnectedUser } from "@breadcoop/ui";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import {
  useBalance,
  useChainId,
  useSendTransaction,
  useSwitchChain,
} from "wagmi";
import { useSimulateAndSponsorTx } from "@/hooks/use-simulate-and-sponsor-tx";
import { useModal } from "../../context";
import {
  Address,
  createWalletClient,
  custom,
  formatEther,
  Hex,
  parseEther,
} from "viem";
import { getDefaultChainDetail } from "@/utils/chain";
import { clientEnv } from "@/lib/env";
import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { breadAbi } from "@/lib/abis/bread-abi";

export interface FundWithConnectedWalletModalAmountModalState {
  type: "FUND_WITH_CONNECTED_WALLET_MODAL_AMOUNT";
  wallet?: string;
}

interface FundWithConnectedWalletModalAmountProps {
  modalState: FundWithConnectedWalletModalAmountModalState;
}

const FundWithConnectedWalletModalAmount = ({
  modalState,
}: FundWithConnectedWalletModalAmountProps) => {
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { user } = useConnectedUser();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { sendTransactionAsync } = useSendTransaction();
  const { setModal } = useModal();
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const [amount, setAmount] = useState("0");
  const [externalAccount, setExternalAccount] = useState<Address | undefined>();

  const xDaiBalance = useBalance({
    address: externalAccount,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: {
      enabled: Boolean(externalAccount),
    },
  });

  useEffect(() => {
    if (!window.ethereum) return;

    const client = createWalletClient({
      chain: getDefaultChainDetail(),
      transport: custom(window.ethereum),
    });

    client.requestAddresses().then(([account]) => {
      if (account) setExternalAccount(account);
    });
  }, []);

  const formattedBalance = +formatEther(xDaiBalance.data?.value || BigInt(0));

  const disabled =
    !amount ||
    Number(amount) <= 0 ||
    (xDaiBalance.data ? Number(amount) > formattedBalance : false);

  const fundWallet = async () => {
    if (
      !(user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN") ||
      disabled
    )
      return;

    const formattedAmount = parseEther(amount);

    try {
      setModal({ type: "WALLET_FUNDING_STATUS", status: "loading" });

      let xDaiDepositHash: Hex;

      if (modalState.wallet) {
        if (currentChainId !== clientEnv.NEXT_PUBLIC_CHAIN_ID) {
          await switchChainAsync({ chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID });
        }

        xDaiDepositHash = await sendTransactionAsync({
          to: user.address,
          value: formattedAmount,
          chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
        });
      } else {
        // this won't trigger
        if (!window.ethereum) return;

        const walletClient = createWalletClient({
          chain: getDefaultChainDetail(),
          transport: custom(window.ethereum),
        });

        const [account] = await walletClient.requestAddresses();

        if (!account) {
          console.warn(
            "[FundWithConnectedWalletContent]: User rejected wallet connection"
          );
          return;
        }

        const currentChainId = await walletClient.getChainId();

        if (currentChainId !== clientEnv.NEXT_PUBLIC_CHAIN_ID) {
          await walletClient.switchChain({
            id: clientEnv.NEXT_PUBLIC_CHAIN_ID,
          });
        }

        xDaiDepositHash = await walletClient.sendTransaction({
          account,
          to: user.address as Address,
          value: formattedAmount,
          chain: getDefaultChainDetail(),
        });
      }

      await waitForTxReceipt(xDaiDepositHash);

      await simulateAndSponsorTx({
        address: BREAD_TOKEN_ADDRESS,
        abi: breadAbi,
        functionName: "mint",
        args: [user.address],
        value: formattedAmount,
        options: {
          uiOptions: {
            showWalletUIs: false,
          },
        },
      });

      setModal({
        type: "WALLET_FUNDING_STATUS",
        status: "success",
        breadAmount: amount,
      });
    } catch (error) {
      console.error(
        "[FundWithConnectedWalletContent]: Transaction failed",
        error
      );
      setModal({
        type: "WALLET_FUNDING_STATUS",
        status: "error",
        onRetry: async () => {
          setModal({ type: "FUND_WALLET", address: user.address });
        },
      });
    }
  };

  return (
    <ModalContainer>
      <div className="flex items-center justify-between">
        <ModalHeader title="Funding Amount" showCloseIcon={false} />
        <button
          type="button"
          onClick={() => {
            if (
              user.status === "CONNECTED" ||
              user.status === "UNSUPPORTED_CHAIN"
            ) {
              setModal({ type: "FUND_WALLET", address: user.address });
            }
          }}
          className="inline-block text-primary-blue font-semibold ml-auto cursor-pointer max-w-max"
        >
          Back
        </button>
      </div>
      <form onSubmit={fundWallet}>
        <Label htmlFor="depositAmount">Amount</Label>
        <div className="relative">
          <NumericInput
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            name="depositAmount"
            id="depositAmount"
            className="w-full"
            allowDecimal
          />
          <div className="absolute top-1/2 -translate-y-1/2 right-1 p-1 flex items-center justify-end gap-2.5">
            <Body bold className="bg-paper-main">
              XDAI
            </Body>
            <button
              onClick={() => {
                if (xDaiBalance.isFetching) return;

                setAmount(`${formattedBalance}`);
              }}
              disabled={xDaiBalance.isFetching}
              type="button"
              className={`inline-block font-bold max-w-max text-sm transition-colors ${xDaiBalance.data ? "text-primary-blue cursor-pointer" : "text-surface-grey cursor-not-allowed"}`}
            >
              Max.
            </button>
          </div>
        </div>
        <Body className="max-w-max ml-auto mt-1 text-sm text-surface-grey">
          Balance:{" "}
          {xDaiBalance.isFetching
            ? "Loading..."
            : formatBalance(formattedBalance)}
        </Body>
        <div className="lifted-button-container mt-6">
          <LocalLiftedButton
            disabled={disabled}
            className={disabled ? "bg-surface-grey text-paper-main" : ""}
            type="submit"
          >
            Fund
          </LocalLiftedButton>
        </div>
      </form>
    </ModalContainer>
  );
};

export default FundWithConnectedWalletModalAmount;
