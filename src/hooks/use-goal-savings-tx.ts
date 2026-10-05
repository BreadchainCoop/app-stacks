import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { useChainConfig } from "@/components/providers/active-chain";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type GoalSavingCirclesAbi = typeof goalSavingCirclesAbi;

export const useGoalSavingsTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const { goalSavings } = useChainConfig();

  const sendGoalSavingsTx = async <
    TFunctionName extends ContractFunctionName<
      GoalSavingCirclesAbi,
      "nonpayable"
    >,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<
      GoalSavingCirclesAbi,
      "nonpayable",
      TFunctionName
    >;
    options?: Parameters<
      ReturnType<typeof useSponsoredTx>["sendSponsoredTransaction"]
    >[1];
  }) => {
    return simulateAndSponsorTx({
      address: goalSavings,
      abi: goalSavingCirclesAbi,
      ...params,
    });
  };

  return { sendGoalSavingsTx };
};
