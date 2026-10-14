import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { conditionalGrantsAbi } from "@/lib/abis/conditional-grants";
import { CONDITIONAL_GRANTS_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type ConditionalGrantsAbi = typeof conditionalGrantsAbi;

export const useConditionalGrantsTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

  const sendConditionalGrantsTx = async <
    TFunctionName extends ContractFunctionName<
      ConditionalGrantsAbi,
      "nonpayable"
    >,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<
      ConditionalGrantsAbi,
      "nonpayable",
      TFunctionName
    >;
    options?: Parameters<
      ReturnType<typeof useSponsoredTx>["sendSponsoredTransaction"]
    >[1];
  }) => {
    return simulateAndSponsorTx({
      address: CONDITIONAL_GRANTS_CONTRACT_ADDRESS,
      abi: conditionalGrantsAbi,
      ...params,
    });
  };

  return { sendConditionalGrantsTx };
};
