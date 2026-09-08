import { useEffect, useState } from "react";
import {
  useBalance,
  useChainId,
  useSendTransaction,
  useSwitchChain,
  useWriteContract,
} from "wagmi";
import {
  Address,
  createWalletClient,
  custom,
  erc20Abi,
  Hex,
  parseEther,
} from "viem";
import { useConnectedUser } from "@breadcoop/ui";
import { useModal } from "@/components/modal/context";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { useSimulateAndSponsorTx } from "@/hooks/use-simulate-and-sponsor-tx";
import { getDefaultChainDetail } from "@/utils/chain";
import { clientEnv } from "@/lib/env";
import { BREAD_TOKEN_ADDRESS } from "@/lib/constants";
import { parseDepositAmount } from "@/lib/deposit-token";
import { isCeloChain } from "@/utils/celo";
import { breadAbi } from "@/lib/abis/bread-abi";

// "BREAD" is the deposit-token option (whatever this deployment's token is);
// the native xDAI option only exists on Gnosis.
export const FUNDING_TOKENS = ["BREAD", "xDAI"] as const;

export type FundingToken = (typeof FUNDING_TOKENS)[number];

interface FundWalletParams {
  token: FundingToken;
  amount: string;
  /** Connected wallet type from the modal state; funds via wagmi when set */
  wallet?: string;
}

export const useFundWithConnectedWallet = () => {
  const currentChainId = useChainId();
  const { switchChainAsync } = useSwitchChain();
  const { user } = useConnectedUser();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { setModal } = useModal();
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const [externalAccount, setExternalAccount] = useState<Address | undefined>();

  const xDaiBalance = useBalance({
    address: externalAccount,
    chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
    query: {
      enabled: Boolean(externalAccount),
    },
  });

  const breadBalance = useBalance({
    address: externalAccount,
    token: BREAD_TOKEN_ADDRESS,
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

    client.getAddresses().then(([account]) => {
      if (account) setExternalAccount(account);
    });
  }, []);

  const fundWallet = async ({ token, amount, wallet }: FundWalletParams) => {
    if (!(user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"))
      return;

    if (token === "xDAI" && isCeloChain(clientEnv.NEXT_PUBLIC_CHAIN_ID)) {
      console.error("Native xDAI funding is not available on Celo");
      return;
    }

    try {
      setModal({ type: "WALLET_FUNDING_STATUS", status: "loading" });

      // Deposit-token amounts use the token's decimals; native xDAI is 18
      const formattedAmount =
        token === "BREAD" ? parseDepositAmount(amount) : parseEther(amount);

      let depositHash: Hex;

      if (wallet) {
        if (currentChainId !== clientEnv.NEXT_PUBLIC_CHAIN_ID) {
          await switchChainAsync({ chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID });
        }

        if (token === "BREAD") {
          depositHash = await writeContractAsync({
            address: BREAD_TOKEN_ADDRESS,
            abi: erc20Abi,
            functionName: "transfer",
            args: [user.address as Address, formattedAmount],
            chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
          });
        } else {
          depositHash = await sendTransactionAsync({
            to: user.address,
            value: formattedAmount,
            chainId: clientEnv.NEXT_PUBLIC_CHAIN_ID,
          });
        }
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

        if (token === "BREAD") {
          depositHash = await walletClient.writeContract({
            account,
            address: BREAD_TOKEN_ADDRESS,
            abi: erc20Abi,
            functionName: "transfer",
            args: [user.address as Address, formattedAmount],
            chain: getDefaultChainDetail(),
          });
        } else {
          depositHash = await walletClient.sendTransaction({
            account,
            to: user.address as Address,
            value: formattedAmount,
            chain: getDefaultChainDetail(),
          });
        }
      }

      await waitForTxReceipt(depositHash);

      if (token === "xDAI") {
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
      }

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

  return { xDaiBalance, breadBalance, fundWallet };
};
