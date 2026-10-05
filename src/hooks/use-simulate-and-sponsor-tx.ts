import { simulateContract } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import {
  encodeFunctionData,
  Abi,
  ContractFunctionName,
  ContractFunctionArgs,
  Address,
} from "viem";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useConnectedUser } from "@breadcoop/ui";
import {
  useActiveChainId,
  useChainConfig,
} from "@/components/providers/active-chain";
import { useWaitForTxReceipt } from "./use-wait-for-tx-receipt";
import { logTxDiagnostics } from "@/utils/debug-tx";
import { useConfig } from "wagmi";

type MutableFunctionName<TAbi extends Abi> = ContractFunctionName<
  TAbi,
  "nonpayable" | "payable"
>;

interface ContractTxParams<
  TAbi extends Abi,
  TFunctionName extends MutableFunctionName<TAbi>,
> {
  address?: Address;
  abi: TAbi;
  functionName: TFunctionName;
  args: ContractFunctionArgs<TAbi, "nonpayable" | "payable", TFunctionName>;
  value?: bigint; // xDAI to send with the call
  /**
   * Override the account the simulation runs as. Defaults to the connected
   * user — pass this when the tx must originate from a specific wallet
   * (e.g. transferring funds out of a user's embedded wallet) rather than
   * whichever wallet useConnectedUser() currently resolves to.
   */
  account?: Address;
}

export const useSimulateAndSponsorTx = () => {
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { user } = useConnectedUser();
  const connectedAccount =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const chainId = useActiveChainId();
  const { savingCircles } = useChainConfig();
  const config = useConfig();

  const simulateAndSponsorTx = async <
    TAbi extends Abi,
    TFunctionName extends MutableFunctionName<TAbi>,
  >({
    address = savingCircles,
    abi,
    functionName,
    args,
    value,
    account = connectedAccount,
    options,
  }: ContractTxParams<TAbi, TFunctionName> & {
    options?: Parameters<typeof sendSponsoredTransaction>[1];
  }) => {
    // Simulate first to catch contract reverts before Privy opens its modal
    await simulateContract(wagmiConfig, {
      address,
      abi,
      functionName,
      args,
      account,
      chainId,
      value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = encodeFunctionData({ abi, functionName, args } as any);

    const { hash } = await sendSponsoredTransaction(
      { to: address, data, value },
      options
    );

    const receipt = await waitForTxReceipt(hash);

    // TEMPORARY diagnostic, no-op unless NEXT_PUBLIC_DEBUG_TX=1.
    await logTxDiagnostics(config, chainId, receipt, String(functionName));

    return receipt;
  };

  return { simulateAndSponsorTx };
};
