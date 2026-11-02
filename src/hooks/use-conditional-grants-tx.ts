import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { conditionalGrantsAbi } from "@/lib/abis/conditional-grants";
import { useChainConfig } from "@/components/providers/active-chain";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type ConditionalGrantsAbi = typeof conditionalGrantsAbi;

export const useConditionalGrantsTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const { conditionalGrants } = useChainConfig();

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
      address: conditionalGrants,
      abi: conditionalGrantsAbi,
      ...params,
    });
  };

  return { sendConditionalGrantsTx };
};
