import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type SavingCirclesAbi = typeof savingCirclesAbi;

export const useSavingCirclesTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sendSponsoredTransaction } = useSponsoredTx();

  const sendSavingCirclesTx = async <
    TFunctionName extends ContractFunctionName<SavingCirclesAbi, "nonpayable">,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<SavingCirclesAbi, "nonpayable", TFunctionName>;
    options?: Parameters<typeof sendSponsoredTransaction>[1];
  }) => {
    return simulateAndSponsorTx({
      address: SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: savingCirclesAbi,
      ...params,
    });
  };

  return { sendSavingCirclesTx };
};
