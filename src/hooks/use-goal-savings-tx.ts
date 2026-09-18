import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { goalSavingCirclesAbi } from "@/lib/abis/goal-saving-circles";
import { GOAL_SAVINGS_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type GoalSavingCirclesAbi = typeof goalSavingCirclesAbi;

export const useGoalSavingsTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

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
      address: GOAL_SAVINGS_CONTRACT_ADDRESS,
      abi: goalSavingCirclesAbi,
      ...params,
    });
  };

  return { sendGoalSavingsTx };
};
