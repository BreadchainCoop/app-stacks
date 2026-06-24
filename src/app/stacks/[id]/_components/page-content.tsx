"use client";

import { useEffect } from "react";
import StackHeader from "./header";
import StackDetails from "./stack-details";
import StackMembers from "./members";
import StackInfo from "./info";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { Body, useConnectedUser } from "@breadcoop/ui";
import StackedStatus from "./stacked-status";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { zeroAddress } from "viem";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useModal } from "@/components/modal/context";
import BackMeta from "./back-meta";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";

const PageContent = ({ id }: { id: string }) => {
  const now = useBlockTimestamp();
  const { setModal } = useModal();
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const member = address || zeroAddress;
  const userCircleData = useUserCircleData({
    circleId: BigInt(id),
    member,
    enabled: Boolean(member),
  });

  const nowSeconds = BigInt(Math.floor(now / 1000));

  useEffect(() => {
    if (!userCircleData.circleData?.isMember) return;

    const status = getUserCircleStatus(
      userCircleData.circleData,
      member,
      {},
      nowSeconds
    );

    if (
      status.status === "failed" &&
      !userCircleData.circleData.isDecommissioned
    ) {
      setModal({ type: "STACK_FAILED", id: BigInt(id) });
    }
  }, [userCircleData.circleData, member]);

  return (
    <>
      <BackMeta
        className="mb-4! -mt-3 md:hidden"
        isLoadingCircleData={userCircleData.isLoading}
        circle={userCircleData.circleData}
      />
      <StackHeader
        id={id}
        isMember={userCircleData.circleData?.isMember}
        isLoadingCircleData={userCircleData.isLoading}
        circle={userCircleData.circleData}
      />
      {userCircleData.circleData ? (
        <>
          <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
            <StackedStatus
              id={id}
              circle={userCircleData.circleData}
              member={member}
            />
            <StackDetails id={id} circle={userCircleData.circleData} />
            <StackMembers
              id={id}
              circle={userCircleData.circleData.circleInfo}
              member={member}
              isMember={userCircleData.circleData?.isMember}
              totalRounds={+userCircleData.circleData.totalRounds.toString()}
            />
            <StackInfo owner={userCircleData.circleData.circleInfo.owner} />
          </div>
        </>
      ) : userCircleData.error ? (
        // TODO: Show correct error message
        <Body className="text-system-red">Unable to get circle data!</Body>
      ) : (
        <div className="flex items-center justify-center">
          <CircularProgressIcon />
        </div>
      )}
    </>
  );
};

export default PageContent;
