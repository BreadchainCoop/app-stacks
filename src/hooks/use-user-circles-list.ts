import { useReadContract } from "wagmi";
import { SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS } from "@/lib/constants";
import { savingCirclesViewerAbi } from "@/lib/abis/saving-circles-viewers";
import { Address, formatEther, zeroAddress } from "viem";
import { ICircleList } from "@/interfaces/circle";
import { useMemo } from "react";
import { getDefaultChainId } from "@/utils/chain";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useBlockTimestamp } from "./use-block-timestamp";
import { useCirclesState } from "./use-circles-state";
import { CircleState } from "@/lib/circle-state";
import { useLinkedExternalWallet } from "./use-linked-external-wallet";

type UserCircleData = Parameters<typeof getUserCircleStatus>[0]["circle"];

const parseCircleData = (
  c: UserCircleData,
  now: bigint,
  circleState: CircleState
): ICircleList => {
  const totalRounds = c.totalRounds;
  const formattedStatus = getUserCircleStatus({
    circle: c,
    config: { includeClaimable: true },
    now,
    circleState,
  });

  const circle = {
    ...c.circleInfo,
    totalMember: Number(totalRounds),
    id: c.circleId,
    status: formattedStatus.status,
    totalPoolBalance: c.totalPoolBalance,
    isMember: c.isMember,
    isDecommissionable: c.isDecommissionable,
    userBalance: c.userBalance,
    depositWindowEnd: c.depositWindowEnd,
  };

  if (c.canWithdraw) {
    return {
      ...circle,
      canWithdraw: true,
      withdrawAmount:
        Number(formatEther(c.circleInfo.depositAmount)) * Number(totalRounds),
    };
  }

  return {
    ...circle,
    canWithdraw: false,
  };
};

export function useUserCirclesList(address: Address | undefined) {
  const blockTimestamp = useBlockTimestamp();
  const { data, isLoading, error } = useReadContract({
    address: SAVING_CIRCLES_VIEWER_CONTRACT_ADDRESS,
    abi: savingCirclesViewerAbi,
    functionName: "getComprehensiveUserData",
    args: [address ?? zeroAddress],
    chainId: getDefaultChainId(),
    query: {
      enabled: Boolean(address),
    },
  });

  const circleIds = useMemo(
    () => (data ? data.circleData.map((circle) => circle.circleId) : []),
    [data]
  );
  const { stateById } = useCirclesState(circleIds);

  const circles = useMemo(() => {
    if (!data) return [];

    const now = BigInt(Math.floor(blockTimestamp / 1000));

    return data.circleData.map((circle) =>
      parseCircleData(
        circle as UserCircleData,
        now,
        stateById.get(circle.circleId.toString()) ?? CircleState.Active
      )
    );
  }, [address, blockTimestamp, data, stateById]);

  return {
    circles,
    financialSummary: data?.financialSummary,
    isLoading,
    error,
  };
}

/**
 * Like useUserCirclesList, but also checks the caller's linked external
 * wallet: a member who was added to a circle under that wallet (rather than
 * their Privy embedded wallet, which `address` normally is) would otherwise
 * never see that circle here. Only merge in the external wallet's circles
 * when `address` is genuinely the caller's own — pass `mergeExternal: false`
 * when `address` is an arbitrary address being viewed (e.g. someone else's
 * public account page).
 */
export function useMyCirclesList(
  address: Address | undefined,
  mergeExternal: boolean
) {
  const externalAddress = useLinkedExternalWallet();
  const shouldMergeExternal =
    mergeExternal &&
    !!externalAddress &&
    (!address || externalAddress.toLowerCase() !== address.toLowerCase());

  const primary = useUserCirclesList(address);
  const external = useUserCirclesList(
    shouldMergeExternal ? externalAddress : undefined
  );

  const circles = useMemo(() => {
    if (!shouldMergeExternal) return primary.circles;

    const byId = new Map(primary.circles.map((c) => [c.id.toString(), c]));

    for (const circle of external.circles) {
      // A circle where the external wallet isn't actually the member (e.g.
      // it's someone else's) still comes back from getComprehensiveUserData
      // with isMember: false - only let it override/add when it's a real
      // membership.
      if (circle.isMember) byId.set(circle.id.toString(), circle);
    }

    return Array.from(byId.values());
  }, [shouldMergeExternal, primary.circles, external.circles]);

  return {
    circles,
    // Unused by any current caller - not worth merging two summaries no one
    // reads.
    financialSummary: primary.financialSummary,
    isLoading: primary.isLoading || (shouldMergeExternal && external.isLoading),
    error: primary.error || external.error,
  };
}
