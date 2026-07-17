"use client";

import Loading from "@/app/loading";
import { useStackSupabase } from "@/hooks/use-stack-supabase";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import { getIntervalBySeconds } from "@/utils/deposit-interval";
import { Body } from "@breadcoop/ui";
import { formatEther, zeroAddress } from "viem";
import { useReadContract } from "wagmi";
import InviteDetails from "./invite-details";
import RequestToJoin from "./request-to-join";

const GeneralInviteFlow = ({ circleId }: { circleId: string }) => {
  const { data: stackMetadata, isLoading: isLoadingMetadata } =
    useStackSupabase(circleId);

  const { data: circle, isLoading: isLoadingCircle } = useReadContract({
    abi: savingCirclesAbi,
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    functionName: "getCircle",
    args: [BigInt(circleId || "0")],
    chainId: getDefaultChainId(),
    query: { enabled: !!circleId },
  });

  if (isLoadingMetadata || isLoadingCircle) {
    return (
      <div className="flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (!stackMetadata || !circle || circle.owner === zeroAddress) {
    return (
      <Body className="text-system-red text-center">
        This stack does not exist.
      </Body>
    );
  }

  const duration =
    getIntervalBySeconds(Number(circle.depositInterval))?.label ?? "-";

  return (
    <>
      <InviteDetails
        name={stackMetadata.stackname}
        circleId={circleId}
        duration={duration}
        members={String(stackMetadata.expected_members)}
        deposit={formatEther(circle.depositAmount)}
      />
      <RequestToJoin circleId={circleId} />
    </>
  );
};

export default GeneralInviteFlow;
