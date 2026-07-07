import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { collectiveFundCirclesAbi } from "@/lib/abis/collective-fund-circles";
import { COLLECTIVE_FUND_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type CollectiveFundCirclesAbi = typeof collectiveFundCirclesAbi;

export const useCollectiveFundTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

  const sendCollectiveFundTx = async <
    TFunctionName extends ContractFunctionName<
      CollectiveFundCirclesAbi,
      "nonpayable"
    >,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<
      CollectiveFundCirclesAbi,
      "nonpayable",
      TFunctionName
    >;
    options?: Parameters<
      ReturnType<typeof useSponsoredTx>["sendSponsoredTransaction"]
    >[1];
  }) => {
    return simulateAndSponsorTx({
      address: COLLECTIVE_FUND_CONTRACT_ADDRESS,
      abi: collectiveFundCirclesAbi,
      ...params,
    });
  };

  return { sendCollectiveFundTx };
};
