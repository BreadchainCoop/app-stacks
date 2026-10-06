import { ContractFunctionName, ContractFunctionArgs } from "viem";
import { microloansAbi } from "@/lib/abis/microloans";
import { MICROLOANS_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";
import { useSponsoredTx } from "./use-sponsored-tx";

type MicroloansAbi = typeof microloansAbi;

export const useMicroloansTx = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

  const sendMicroloansTx = async <
    TFunctionName extends ContractFunctionName<MicroloansAbi, "nonpayable">,
  >(params: {
    functionName: TFunctionName;
    args: ContractFunctionArgs<MicroloansAbi, "nonpayable", TFunctionName>;
    options?: Parameters<
      ReturnType<typeof useSponsoredTx>["sendSponsoredTransaction"]
    >[1];
  }) => {
    return simulateAndSponsorTx({
      address: MICROLOANS_CONTRACT_ADDRESS,
      abi: microloansAbi,
      ...params,
    });
  };

  return { sendMicroloansTx };
};
