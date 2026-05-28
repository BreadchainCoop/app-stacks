import { useReadContract } from "wagmi";
import { Address } from "viem";
import { automaticSavingCirclesAbi } from "@/lib/abis/automatic-saving-circles";
import { AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { useSimulateAndSponsorTx } from "./use-simulate-and-sponsor-tx";

export const useIsAutomaticClaimsEnabled = ({
  circleId,
  accountAddress,
}: {
  circleId: string;
  accountAddress?: Address;
}) => {
  return useReadContract({
    address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: automaticSavingCirclesAbi,
    functionName: "isAutomaticClaimsEnabled",
    args: accountAddress ? [BigInt(circleId), accountAddress] : undefined,
    query: { enabled: Boolean(accountAddress) },
  });
};

export const useSetAutomaticClaimsEnabled = () => {
  const { simulateAndSponsorTx } = useSimulateAndSponsorTx();

  const setAutomaticClaimsEnabled = async ({
    circleId,
    enabled,
  }: {
    circleId: string;
    enabled: boolean;
  }) => {
    return simulateAndSponsorTx({
      address: AUTOMATIC_SAVING_CIRCLES_CONTRACT_ADDRESS,
      abi: automaticSavingCirclesAbi,
      functionName: "setAutomaticClaimsEnabled",
      args: [BigInt(circleId), enabled],
    });
  };

  return { setAutomaticClaimsEnabled };
};
