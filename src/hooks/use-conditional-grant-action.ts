import { StackTxAction, useModal } from "@/components/modal/context";
import { useConditionalGrantsTx } from "@/hooks/use-conditional-grants-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { conditionalGrantsAbi } from "@/lib/abis/conditional-grants";
import { CONDITIONAL_GRANTS_CONTRACT_ADDRESS } from "@/lib/constants";
import { CONDITIONAL_GRANTS_ERRORS } from "@/lib/contract-errors";
import { getDefaultChainId } from "@/utils/chain";
import { parseContractError } from "@/utils/parse-contract-error";
import { wagmiConfig } from "@/components/providers/web3";
import { useConnectedUser } from "@breadcoop/ui";
import { readContract } from "@wagmi/core";
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

type ConditionalGrantsAbi = typeof conditionalGrantsAbi;

/**
 * Runs a conditional grants write behind the generic STACK_TX_LOADING /
 * STACK_TX_RESULT modals: optionally ensures the ERC-20 allowance first
 * (for token-pulling actions like create and pay back), sends the tx through
 * the conditional grants tx hook, then refreshes contract reads and reports the
 * outcome. Mirrors useGoalAction.
 *
 * Also exposes the connected wallet's token balance so callers can route a
 * low balance in MiniPay to Add Cash before sending anything.
 *
 * @param tokenAddress The token — required only by actions that pass
 *   `approveAmount`, and for `balance`.
 */
export function useConditionalGrantAction(tokenAddress?: Address) {
  const modal = useModal();
  const queryClient = useQueryClient();
  const { sendConditionalGrantsTx } = useConditionalGrantsTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { user } = useConnectedUser();
  const userAddress = user.status === "CONNECTED" ? user.address : undefined;

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress!],
    query: { enabled: !!userAddress && !!tokenAddress },
    chainId: getDefaultChainId(),
  });

  const runConditionalGrantAction = async <
    TFunctionName extends ContractFunctionName<
      ConditionalGrantsAbi,
      "nonpayable"
    >,
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
    args: ContractFunctionArgs<
      ConditionalGrantsAbi,
      "nonpayable",
      TFunctionName
    >;
    /** Operation-specific error map (merged over the full conditional grants map). */
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
      stackType: "conditionalGrant",
      action,
    });

    try {
      // Approve exactly what this action pulls, decided from a fresh read: the
      // contract is upgradeable, so a standing unlimited allowance would put the
      // whole wallet balance behind the upgrade key, not just what is escrowed.
      if (
        approveAmount !== undefined &&
        tokenAddress &&
        (await readAllowance(tokenAddress, userAddress)) < approveAmount
      ) {
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [CONDITIONAL_GRANTS_CONTRACT_ADDRESS, approveAmount],
        });

        const { hash } = await sendSponsoredTransaction({
          to: tokenAddress,
          data: approveData,
        });

        await waitForTxReceipt(hash);
        // Public RPCs are load-balanced and a node can lag the one that saw
        // the receipt; simulating there would revert on the old allowance.
        await waitForAllowance(tokenAddress, userAddress, approveAmount);
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
      }

      const receipt = await sendConditionalGrantsTx({ functionName, args });

      // Refresh now, then again shortly after in case the RPC node that
      // answers the first refetch hasn't seen this block yet
      const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
        queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      };
      refresh();
      setTimeout(refresh, 2_000);
      setTimeout(refresh, 6_000);
      onSuccess?.(receipt);
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "conditionalGrant",
        action,
        result: "success",
        amount,
      });
    } catch (error) {
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "conditionalGrant",
        action,
        result: "error",
        msg: parseContractError(error, {
          ...CONDITIONAL_GRANTS_ERRORS,
          ...errors,
        }),
      });
    }
  };

  return { runConditionalGrantAction, balance };
}

/** The allowance as the RPC the simulation uses sees it right now. */
function readAllowance(token: Address, owner: Address | undefined) {
  if (!owner) return Promise.resolve(BigInt(0));
  return readContract(wagmiConfig, {
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, CONDITIONAL_GRANTS_CONTRACT_ADDRESS],
    chainId: getDefaultChainId(),
  }).catch(() => BigInt(0));
}

/** Poll until the RPC reports the new allowance, so the simulation won't revert on the old one. */
async function waitForAllowance(
  token: Address,
  owner: Address | undefined,
  amount: bigint
) {
  for (let attempt = 0; attempt < 10; attempt++) {
    if ((await readAllowance(token, owner)) >= amount) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(
    "The approval went through but the network hasn't caught up yet. Please try again in a moment."
  );
}
