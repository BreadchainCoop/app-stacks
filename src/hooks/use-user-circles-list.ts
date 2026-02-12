import { useReadContract } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address, formatEther } from "viem";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";

export function useUserCirclesList(address: Address) {
  const { data, isLoading, error } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getComprehensiveUserData",
    args: address ? [address] : undefined,
    chainId: getDefaultChainId(),
  });

  const circles = useMemo(() => {
    if (!data) return [];

    // @ts-expect-error Correct
    const parsedCircle: ICircleList[] = data.circleData.map((c) => {
      const totalRounds = c.totalRounds;

      const status = getUserCircleStatus(c, address, {
        includeClaimable: true,
      }).status;
      const canWithdraw = c.canWithdraw && c.isCurrentWithdrawer;

      return {
        ...c.circleInfo,
        totalMember: Number(totalRounds),
        id: c.circleId,
        status,
        totalPoolBalance: c.totalPoolBalance,
        canWithdraw,
        ...(canWithdraw && {
          withdrawAmount:
            Number(formatEther(c.circleInfo.depositAmount)) *
            Number(totalRounds),
        }),
      };
    });

    return parsedCircle;
  }, [data]);

  return { circles, isLoading, error };
}
