import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type AutomaticSavingCirclesAbi = typeof automaticSavingCirclesAbi;

export const useAutomaticSavingCirclesTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

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
      address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
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
