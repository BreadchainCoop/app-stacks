import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { accumulatingSavingCirclesAbi } from "@/lib/abis/accumulating-saving-circles";
import { ASCA_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type AscaAbi = typeof accumulatingSavingCirclesAbi;

export const useAscaTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

  const sendAscaTx = async <
    TFunctionName extends ContractFunctionName<AscaAbi, "nonpayable">,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<AscaAbi, "nonpayable", TFunctionName>;
    options?: Parameters<
      ReturnType<typeof useSponsoredTx>["sendSponsoredTransaction"]
    >[1];
  }) => {
    return simulateAndSponsorTx({
      address: ASCA_CONTRACT_ADDRESS,
      abi: accumulatingSavingCirclesAbi,
      ...params,
    });
  };

  return { sendAscaTx };
};
