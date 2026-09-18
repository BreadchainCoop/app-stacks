import { StackTxAction, useModal } from "@/components/modal/context";
import { useGoalSavingsTx } from "@/hooks/use-goal-savings-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { GOAL_SAVINGS_ERRORS } from "@/lib/contract-errors";
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
} from "viem";
import { useReadContract } from "wagmi";

type GoalAbi = typeof goalSavingCirclesAbi;

/**
 * Runs a goal-savings write behind the generic STACK_TX_LOADING /
 * STACK_TX_RESULT modals: optionally ensures the ERC-20 allowance first
 * (for token-pulling actions like deposit), sends the tx through the
 * goal-savings tx hook, then refreshes contract reads and reports the
 * outcome.
 *
 * @param tokenAddress The goal token — required only by actions that pass
 *   `approveAmount`.
 */
export function useGoalAction(tokenAddress?: Address) {
  const modal = useModal();
  const queryClient = useQueryClient();
  const { sendGoalSavingsTx } = useGoalSavingsTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { user } = useConnectedUser();
  const userAddress = user.status === "CONNECTED" ? user.address : undefined;

  const { data: allowance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress!, GOAL_SAVINGS_CONTRACT_ADDRESS],
    query: { enabled: !!userAddress && !!tokenAddress },
    chainId: getDefaultChainId(),
  });

  const runGoalAction = async <
    TFunctionName extends ContractFunctionName<GoalAbi, "nonpayable">,
  >({
    action,
    functionName,
    args,
    errors,
    approveAmount,
    amount,
  }: {
    action: StackTxAction;
    functionName: TFunctionName;
    args: ContractFunctionArgs<GoalAbi, "nonpayable", TFunctionName>;
    /** Operation-specific error map (merged over the full goal map). */
    errors: Record<string, string>;
    /** For token-pulling actions: ensure at least this allowance first. */
    approveAmount?: bigint;
    /** Shown in the success modal when set. */
    amount?: bigint;
  }) => {
    modal.setModal({ type: "STACK_TX_LOADING", stackType: "goal", action });

    try {
      if (
        approveAmount !== undefined &&
        tokenAddress &&
        allowance < approveAmount
      ) {
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [GOAL_SAVINGS_CONTRACT_ADDRESS, MAX_UINT256],
        });

        const { hash } = await sendSponsoredTransaction({
          to: tokenAddress,
          data: approveData,
        });

        await waitForTxReceipt(hash);
      }

      await sendGoalSavingsTx({ functionName, args });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "goal",
        action,
        result: "success",
        amount,
      });
    } catch (error) {
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "goal",
        action,
        result: "error",
        msg: parseContractError(error, { ...GOAL_SAVINGS_ERRORS, ...errors }),
      });
    }
  };

  return { runGoalAction };
}
