import { StackTxAction, useModal } from "@/components/modal/context";
import { useConditionalGrantsTx } from "@/hooks/use-conditional-grants-tx";
import { useSponsoredTx } from "@/hooks/use-sponsored-tx";
import { useWaitForTxReceipt } from "@/hooks/use-wait-for-tx-receipt";
import { conditionalGrantsAbi } from "@/lib/abis/conditional-grants";
import { CONDITIONAL_GRANTS_ERRORS } from "@/lib/contract-errors";
import {
  useActiveChainId,
  useChainConfig,
  useDepositToken,
} from "@/components/providers/active-chain";
import { parseContractError } from "@/utils/parse-contract-error";
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
import { type Config, useConfig, useReadContract } from "wagmi";

type ConditionalGrantsAbi = typeof conditionalGrantsAbi;

/** The second step's name, for the actions that pull tokens after an approval */
const ACTION_LABELS: Partial<Record<StackTxAction, string>> = {
  createGrant: "Offer the grant",
  payBack: "Pay back",
};

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
  // The provider stack's config (Privy on the web, the injected wallet in MiniPay)
  const config = useConfig();
  const chainId = useActiveChainId();
  const { conditionalGrants } = useChainConfig();
  const depositToken = useDepositToken();

  const { data: balance } = useReadContract({
    address: tokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [userAddress!],
    query: { enabled: !!userAddress && !!tokenAddress },
    chainId,
  });

  const allowanceRead: AllowanceRead = {
    config,
    chainId,
    spender: conditionalGrants,
  };

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
    const loading = (steps?: { current: number; labels: string[] }) =>
      modal.setModal({
        type: "STACK_TX_LOADING",
        stackType: "conditionalGrant",
        action,
        steps,
      });
    loading();

    try {
      // Approve exactly what this action pulls, decided from a fresh read: the
      // contract is upgradeable, so a standing unlimited allowance would put the
      // whole wallet balance behind the upgrade key, not just what is escrowed.
      if (
        approveAmount !== undefined &&
        tokenAddress &&
        (await readAllowance(allowanceRead, tokenAddress, userAddress)) <
          approveAmount
      ) {
        // Two transactions: show which one the wallet is asking for
        const labels = [
          `Approve ${depositToken.symbol}`,
          ACTION_LABELS[action] ?? "Confirm",
        ];
        loading({ current: 1, labels });

        const approveData = encodeFunctionData({
          abi: erc20Abi,
          functionName: "approve",
          args: [conditionalGrants, approveAmount],
        });

        const { hash } = await sendSponsoredTransaction({
          to: tokenAddress,
          data: approveData,
        });

        await waitForTxReceipt(hash);
        // Public RPCs are load-balanced and a node can lag the one that saw
        // the receipt; simulating there would revert on the old allowance.
        await waitForAllowance(
          allowanceRead,
          tokenAddress,
          userAddress,
          approveAmount
        );
        queryClient.invalidateQueries({ queryKey: ["readContract"] });
        loading({ current: 2, labels });
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

type AllowanceRead = { config: Config; chainId: number; spender: Address };

/** The allowance as the RPC the simulation uses sees it right now. */
function readAllowance(
  { config, chainId, spender }: AllowanceRead,
  token: Address,
  owner: Address | undefined
) {
  if (!owner) return Promise.resolve(BigInt(0));
  return readContract(config, {
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [owner, spender],
    chainId,
  }).catch(() => BigInt(0));
}

/** Poll until the RPC reports the new allowance, so the simulation won't revert on the old one. */
async function waitForAllowance(
  read: AllowanceRead,
  token: Address,
  owner: Address | undefined,
  amount: bigint
) {
  for (let attempt = 0; attempt < 10; attempt++) {
    if ((await readAllowance(read, token, owner)) >= amount) return;
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(
    "The approval went through but the network hasn't caught up yet. Please try again in a moment."
  );
}
