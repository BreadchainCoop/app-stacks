import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";
import { useChainConfig } from "@/components/providers/active-chain";

type AutomaticSavingCirclesAbi = typeof automaticSavingCirclesAbi;

export const useAutomaticSavingCirclesTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  const { automaticSavingCircles } = useChainConfig();

  const sendAutomaticSavingCirclesTx = async <
    TFunctionName extends ContractFunctionName<
      AutomaticSavingCirclesAbi,
      "nonpayable"
    >,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<
      AutomaticSavingCirclesAbi,
      "nonpayable",
      TFunctionName
    >;
    options?: Parameters<
      ReturnType<typeof useSponsoredTx>["sendSponsoredTransaction"]
    >[1];
  }) => {
    return simulateAndSponsorTx({
      address: automaticSavingCircles,
      abi: automaticSavingCirclesAbi,
      options: {
        uiOptions: {
          showWalletUIs: false,
        },
      },
      ...params,
    });
  };

  return { sendAutomaticSavingCirclesTx };
};
