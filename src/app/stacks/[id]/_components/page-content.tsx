"use client";

import { useEffect } from "react";
import StackHeader from "./header";
import StackDetails from "./stack-details";
import ClaimSchedule from "./claim-schedule";
import StackMembers from "./members";
import StackInfo from "./info";
import Link from "next/link";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import LocalButton from "@/components/button";
import { CircularProgressIcon } from "@/components/icons/circular-progress";
import { Body, useConnectedUser } from "@breadcoop/ui";
import StackedStatus from "./stacked-status";
import OwedRefunds from "./owed-refunds";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { zeroAddress } from "viem";
import { getUserCircleStatus } from "@/lib/get-user-circle-status";
import { useModal } from "@/components/modal/context";
import BackMeta from "./back-meta";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState } from "@/lib/circle-state";

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
  const { circleState } = useCircleState(BigInt(id));

  const circleExists =
    !!userCircleData.circleData &&
    userCircleData.circleData.circleInfo.owner !== zeroAddress;

  const circleStatus = userCircleData.circleData
    ? getUserCircleStatus({
        circle: userCircleData.circleData,
        now: nowSeconds,
        circleState: circleState ?? CircleState.Active,
      })
    : null;

  useEffect(() => {
    if (!userCircleData.circleData?.isMember) return;

    if (
      circleStatus?.status === "failed" &&
      !userCircleData.circleData.isDecommissioned
    ) {
      setModal({ type: "STACK_FAILED", id: BigInt(id) });
    }
  }, [userCircleData.circleData, member, circleState]);

  return (
    <>
      <BackMeta
        className="mb-4! -mt-3 md:hidden"
        isLoadingCircleData={userCircleData.isLoading}
        circle={circleExists ? userCircleData.circleData : undefined}
      />
      <StackHeader
        id={id}
        isMember={userCircleData.circleData?.isMember}
        isLoadingCircleData={userCircleData.isLoading}
        circle={circleExists ? userCircleData.circleData : undefined}
      />
      {circleExists && userCircleData.circleData ? (
        <>
          <div className="*:mb-4 last:mb-0 md:mb-6 md:last:mb-0">
            <StackedStatus
              id={id}
              circle={userCircleData.circleData}
              member={member}
            />
            <StackDetails id={id} circle={userCircleData.circleData} />
            {userCircleData.circleData.isMember && (
              <ClaimSchedule id={id} circle={userCircleData.circleData} />
            )}
            <StackMembers
              id={id}
              circle={userCircleData.circleData.circleInfo}
              member={member}
              isMember={userCircleData.circleData?.isMember}
              totalRounds={+userCircleData.circleData.totalRounds.toString()}
              circleStatus={circleStatus?.status ?? null}
            />
            {userCircleData.circleData.isMember &&
              (circleStatus?.status === "failed" ||
                userCircleData.circleData.isDecommissioned) && (
                <OwedRefunds
                  id={id}
                  depositAmount={
                    userCircleData.circleData.circleInfo.depositAmount
                  }
                  totalRounds={
                    +userCircleData.circleData.totalRounds.toString()
                  }
                  circleStartsTimestamp={
                    userCircleData.circleData.circleInfo
                      .effectiveCircleStartTime
                  }
                  depositInterval={
                    userCircleData.circleData.circleInfo.depositInterval
                  }
                />
              )}
            <StackInfo owner={userCircleData.circleData.circleInfo.owner} />
          </div>
        </>
      ) : userCircleData.error ? (
        // TODO: Show correct error message
        <Body className="text-system-red">Unable to get circle data!</Body>
      ) : userCircleData.circleData ? (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <Body className="text-system-red">This stack does not exist.</Body>
          <LocalButton as={Link} href="/new" leftIcon={<PlusIcon />}>
            Start your Stack today
          </LocalButton>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <CircularProgressIcon />
        </div>
      )}
    </>
  );
};

export default PageContent;
