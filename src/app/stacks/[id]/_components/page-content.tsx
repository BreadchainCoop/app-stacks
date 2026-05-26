"use client";

import React, { useEffect } from "react";
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

const FINISHED_STATUSES = ["decommissioned", "expired", "failed", "finished"] as const;

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

  const circleStatus = userCircleData.circleData
    ? getUserCircleStatus(
        userCircleData.circleData,
        member,
        {},
        BigInt(Math.floor(now / 1000))
      )
    : null;
  const isFinishedStack =
    circleStatus !== null &&
    (FINISHED_STATUSES as readonly string[]).includes(circleStatus.status);

  useEffect(() => {
    if (!userCircleData.circleData?.isMember) return;

    const circleStatus = getUserCircleStatus(
      userCircleData.circleData,
      member,
      {},
      BigInt(Math.floor(now / 1000))
    );

    if (
      circleStatus.status === "failed" &&
      !userCircleData.circleData.isDecommissioned
    ) {
      setModal({ type: "STACK_FAILED", id: BigInt(id) });
    }
  }, [userCircleData.circleData, member]);

  console.log("__ CIRCLE DATA __", userCircleData.circleData);

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
              isFinished={isFinishedStack}
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

// const before = {
//   canWithdraw: false,
//   circleId: 1n,
//   circleInfo: {
//     circleEnd: 0n,
//     currentIndex: 0n,
//     depositAmount: 3400000000000000000n,
//     depositInterval: 259200n,
//     effectiveCircleStartTime: 0n,
//     owner: "0xa90Bb4F04725688b792908105AA0F37a55004Bbc",
//     token: "0x906B067e392e2c5f9E4f101f36C0b8CdA4885EBf",
//   },
//   completedRounds: 0n,
//   currentWithdrawer: "0x0000000000000000000000000000000000000000",
//   depositWindowEnd: 259200n,
//   isCurrentWithdrawer: false,
//   isDecommissionable: false,
//   isDecommissioned: false,
//   isExpired: true,
//   isMember: true,
//   isOwner: true,
//   nextWithdrawTime: 0n,
//   remainingDepositsNeeded: 3n,
//   totalPoolBalance: 0n,
//   totalRounds: 3n,
//   userBalance: 0n,
// };

// const after = {
//   canWithdraw: false,
//   circleId: 1n,
//   circleInfo: {
//     circleEnd: 1778482171n,
//     currentIndex: 0n,
//     depositAmount: 3400000000000000000n,
//     depositInterval: 259200n,
//     effectiveCircleStartTime: 1777704571n,
//     owner: "0xa90Bb4F04725688b792908105AA0F37a55004Bbc",
//     token: "0x906B067e392e2c5f9E4f101f36C0b8CdA4885EBf",
//   },
//   completedRounds: 0n,
//   currentWithdrawer: "0xa90Bb4F04725688b792908105AA0F37a55004Bbc",
//   depositWindowEnd: 1777963771n,
//   isCurrentWithdrawer: true,
//   isDecommissionable: false,
//   isDecommissioned: false,
//   isExpired: false,
//   isMember: true,
//   isOwner: true,
//   nextWithdrawTime: 1777704571n,
//   remainingDepositsNeeded: 3n,
//   totalPoolBalance: 0n,
//   totalRounds: 3n,
//   userBalance: 0n,
// };
