import { StackTxAction, useModal } from "@/components/modal/context";
import { useAscaTx } from "@/hooks/use-asca-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { ASCA_ERRORS } from "@/lib/contract-errors";
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

type AscaAbi = typeof accumulatingSavingCirclesAbi;

/**
 * Runs an ASCA write behind the generic STACK_TX_LOADING / STACK_TX_RESULT
 * modals: optionally ensures the ERC-20 allowance first (for token-pulling
 * actions like deposit and repay), sends the tx through the ASCA tx hook,
 * then refreshes contract reads and reports the outcome.
 *
 * @param tokenAddress The fund token — required only by actions that pass
 *   `approveAmount`.
 */
export function useAscaAction(tokenAddress?: Address) {
  const modal = useModal();
  const queryClient = useQueryClient();
  const { sendAscaTx } = useAscaTx();
  const { sendSponsoredTransaction } = useSponsoredTx();
  const { waitForTxReceipt } = useWaitForTxReceipt();
  const { user } = useConnectedUser();
  const userAddress = user.status === "CONNECTED" ? user.address : undefined;

  const { data: allowance = BigInt(0) } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: [userAddress!, ASCA_CONTRACT_ADDRESS],
    query: { enabled: !!userAddress && !!tokenAddress },
    chainId: getDefaultChainId(),
  });

  const runAscaAction = async <
    TFunctionName extends ContractFunctionName<AscaAbi, "nonpayable">,
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
    args: ContractFunctionArgs<AscaAbi, "nonpayable", TFunctionName>;
    /** Operation-specific error map (merged over the full ASCA map). */
    errors: Record<string, string>;
    /** For token-pulling actions: ensure at least this allowance first. */
    approveAmount?: bigint;
    /** Shown in the success modal when set. */
    amount?: bigint;
  }) => {
    modal.setModal({ type: "STACK_TX_LOADING", stackType: "asca", action });

    try {
      if (
        approveAmount !== undefined &&
        tokenAddress &&
        allowance < approveAmount
      ) {
        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [ASCA_CONTRACT_ADDRESS, MAX_UINT256],
        });

        const { hash } = await sendSponsoredTransaction({
          to: tokenAddress,
          data: approveData,
        });

        await waitForTxReceipt(hash);
      }

      await sendAscaTx({ functionName, args });

      queryClient.invalidateQueries({ queryKey: ["readContract"] });
      queryClient.invalidateQueries({ queryKey: ["readContracts"] });
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "asca",
        action,
        result: "success",
        amount,
      });
    } catch (error) {
      modal.setModal({
        type: "STACK_TX_RESULT",
        stackType: "asca",
        action,
        result: "error",
        msg: parseContractError(error, { ...ASCA_ERRORS, ...errors }),
      });
    }
  };

  return { runAscaAction };
}
