import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { yieldSavingCirclesAbi } from "@/lib/abis/yield-saving-circles";
import { YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type YieldSavingCirclesAbi = typeof yieldSavingCirclesAbi;

// Sends txs to the yield-bearing saving-circles variant (YieldSavingCircles).
// Mirrors useSavingCirclesTx; used for claim(keepStaked) / claimYield /
// withdrawStakedPrincipal / setClaimTiming.
export const useYieldSavingCirclesTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { sendSponsoredTransaction } = useSponsoredTx();

  const sendYieldSavingCirclesTx = async <
    TFunctionName extends ContractFunctionName<YieldSavingCirclesAbi, "nonpayable">,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<YieldSavingCirclesAbi, "nonpayable", TFunctionName>;
    options?: Parameters<typeof sendSponsoredTransaction>[1];
  }) => {
    return simulateAndSponsorTx({
      address: YIELD_SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: yieldSavingCirclesAbi,
      ...params,
    });
  };

  return { sendYieldSavingCirclesTx };
};
