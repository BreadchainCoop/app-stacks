import { StackTxAction, useModal } from "@/components/modal/context";
import { useMicroloansTx } from "@/hooks/use-microloans-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { microloansAbi } from "@/lib/abis/microloans";
import { MICROLOANS_CONTRACT_ADDRESS } from "@/lib/constants";
import { MICROLOANS_ERRORS } from "@/lib/contract-errors";
import { getDefaultChainId } from "@/utils/chain";
import { parseContractError } from "@/utils/parse-contract-error";
import { MAX_UINT256 } from "@/utils/solidity";
import { useConnectedUser } from "@breadcoop/ui";
import { useQueryClient } from "@tanstack/react-query";
import {
  Address,
  ContractFunctionArgs,
  ContractFunctionName,
  encodeFunctionData,
  erc20Abi,
  TransactionReceipt,
} from "viem";
import { useReadContract } from "wagmi";

type MicroloansAbi = typeof microloansAbi;

/**
 * Runs a microloans write behind the generic STACK_TX_LOADING /
 * STACK_TX_RESULT modals: optionally ensures the ERC-20 allowance first
 * (for token-pulling actions like create and repay), sends the tx through
 * the microloans tx hook, then refreshes contract reads and reports the
 * outcome. Mirrors useGoalAction.
 *
 * Also exposes the connected wallet's token balance so callers can route a
 * low balance in MiniPay to Add Cash before sending anything.
 *
 * @param tokenAddress The loan token — required only by actions that pass
 *   `approveAmount`, and for `balance`.
 */
export function useMicroloanAction(tokenAddress?: Address) {
  const modal = useModal();
  const queryClient = useQueryClient();
  const { sendMicroloansTx } = useMicroloansTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { user } = useConnectedUser();
  const userAddress = user.status === "CONNECTED" ? user.address : undefined;

  const { data: allowance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress!, MICROLOANS_CONTRACT_ADDRESS],
    query: { enabled: !!userAddress && !!tokenAddress },
    chainId: getDefaultChainId(),
  });

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress!],
    query: { enabled: !!userAddress && !!tokenAddress },
    chainId: getDefaultChainId(),
  });

  const runMicroloanAction = async <
    TFunctionName extends ContractFunctionName<MicroloansAbi, "nonpayable">,
  >({
    action,
    functionName,
    args,
    errors,
    approveAmount,
    amount,
    onSuccess,
  }: {
    action: StackTxAction;
    functionName: TFunctionName;
    args: ContractFunctionArgs<MicroloansAbi, "nonpayable", TFunctionName>;
    /** Operation-specific error map (merged over the full microloans map). */
    errors: Record<string, string>;
    /** For token-pulling actions: ensure at least this allowance first. */
    approveAmount?: bigint;
    /** Shown in the success modal when set. */
    amount?: bigint;
    /** Runs after the tx is mined, before the success modal (e.g. redirect). */
    onSuccess?: (receipt: TransactionReceipt) => void;
  }) => {
    modal.setModal({
      type: "STACK_TX_LOADING",
      stackType: "microloan",
      action,
    });

    try {
      if (
        approveAmount !== undefined &&
        tokenAddress &&
        allowance < approveAmount
      ) {
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [MICROLOANS_CONTRACT_ADDRESS, MAX_UINT256],
        });

        const { hash } = await sendSponsoredTransaction({
          to: tokenAddress,
          data: approveData,
        });

        await waitForTxReceipt(hash);
      }

      const receipt = await sendMicroloansTx({ functionName, args });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      onSuccess?.(receipt);
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "microloan",
        action,
        result: "success",
        amount,
      });
    } catch (error) {
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "microloan",
        action,
        result: "error",
        msg: parseContractError(error, { ...MICROLOANS_ERRORS, ...errors }),
      });
    }
  };

  return { runMicroloanAction, balance };
}
