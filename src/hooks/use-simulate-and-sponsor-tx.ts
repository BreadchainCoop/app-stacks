import { simulateContract } from "@wagmi/core";
import { wagmiConfig } from "@/components/providers/web3";
import {
  encodeFunctionData,
  Abi,
  ContractFunctionName,
  ContractFunctionArgs,
  Address,
} from "viem";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useConnectedUser } from "@breadcoop/ui";
import { getDefaultChainId } from "@/utils/chain";
import { useWaitForTxReceipt } from "./use-wait-for-tx-receipt";

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
}

export const useSimulateAndSponsorTx = () => {
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { user } = useConnectedUser();
  const account = user.status === "CONNECTED" ? user.address : undefined;

  const simulateAndSponsorTx = async <
    TAbi extends Abi,
    TFunctionName extends MutableFunctionName<TAbi>,
  >({
    address = SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi,
    functionName,
    args,
    value,
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
      chainId: getDefaultChainId(),
      value,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = encodeFunctionData({ abi, functionName, args } as any);

    const { hash } = await sendSponsoredTransaction(
      { to: address, data, value },
      options
    );

    return await waitForTxReceipt(hash);
  };

  return { simulateAndSponsorTx };
};
