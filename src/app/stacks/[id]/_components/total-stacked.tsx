import {
  Body,
  formatBalance,
  FormattedDecimalNumber,
  Heading3,
  LoginButton,
  useConnectedUser,
} from "@breadcoop/ui";
import { useCircleStatus } from "@/hooks/use-circle-status";
import Loading from "@/app/loading";
import { cn } from "@/lib/utils";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import LastClaim from "./last-claim";
import { ReactNode } from "react";
import { Address, formatEther } from "viem";
import ClaimButton from "@/components/claim-button";
import { useGetLastClaimed } from "@/hooks/use-get-last-claimed";
import { formatRelativeTime } from "@/utils/time";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { AutomaticClaim } from "./automatic-claim";
import { useCircleState } from "@/hooks/use-circles-state";
import { CircleState } from "@/lib/circle-state";
import {
  FAILED_STACK_STATUSES,
  getUserCircleStatus,
} from "@/lib/get-user-circle-status";

const TotalStacked = ({
  id,
  status,
}: {
  id: string;
  status: ReturnType<typeof useCircleStatus>;
}) => {
  const userCircleData = useUserCircleData({ circleId: BigInt(id) });
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const now = useBlockTimestamp();
  const { circleState } = useCircleState(BigInt(id));
  const isFailedStack = userCircleData.circleData
    ? FAILED_STACK_STATUSES.includes(
        getUserCircleStatus({
          circle: userCircleData.circleData,
          now: BigInt(Math.floor(now / 1000)),
          circleState: circleState ?? CircleState.Active,
        }).status
      )
    : false;

  const claimableAmount = userCircleData.circleData?.canWithdraw
    ? userCircleData.circleData?.circleInfo.depositAmount *
      BigInt(userCircleData.circleData?.totalRounds)
    : BigInt(0);
  let amount: string | number = "-";

  let msg: ReactNode = "";

  const circleNotStarted =
    userCircleData.circleData &&
    userCircleData.circleData.circleInfo.effectiveCircleStartTime === BigInt(0);

  if (userCircleData.circleData) {
    if (circleNotStarted) {
      msg = "You can claim now or  later.";
    } else {
      amount = Number(formatEther(claimableAmount));
      msg = "You can claim now or later.";
    }
  }

  return (
    <section
      className={cn(
        "border border-[#CBE9E5] bg-paper-0 py-8 px-5 mb-4.25 md:mb-0 md:order-2 md:flex-1 md:max-w-112.75",
        !address && "flex flex-col items-center justify-center"
      )}
    >
      <Heading3 className="pb-3.5 border-b border-paper-2 text-center mb-4.25 text-2xl font-bold w-full">
        Total deposited for you
      </Heading3>
      {!address ? (
        <div className="h-full w-full flex items-center justify-center">
          <LoginButton app="stacks" status={user.status} />
        </div>
      ) : (
        <>
          {status.isLoading ? (
            <div className="flex items-center justify-center">
              <Loading />
            </div>
          ) : (
            <>
              <div className="py-4 flex flex-col gap-4 items-center mb-4.25">
                {amount === "-" ? (
                  <div>
                    <span className="text-[3rem] text-surface-ink font-black">
                      $ -
                    </span>
                  </div>
                ) : (
                  <FormattedDecimalNumber
                    value={amount}
                    unit="$"
                    integralPartClassName="text-[3rem] text-surface-ink"
                    decimalPartClassName="text-[2.21rem] text-surface-grey-2"
                  />
                )}
                <div className="flex flex-col gap-2 items-center -mt-4">
                  <Body className="text-surface-grey-2">
                    {amount === "-"
                      ? "-"
                      : `$${formatBalance(Number(amount), 2)}`}
                  </Body>
                  <Body className="text-xs">{msg}</Body>
                </div>
              </div>
              <LastClaim
                id={id}
                effectiveCircleStartTime={
                  userCircleData.circleData?.circleInfo.effectiveCircleStartTime
                }
              />

              {circleNotStarted ? (
                <Body className="disable-like-btn w-full font-semibold text-paper-main">
                  Awaiting start
                </Body>
              ) : typeof amount === "number" && amount > 0 ? (
                <ClaimButton
                  circleId={BigInt(id)}
                  amount={amount}
                  label="Claim funds"
                  nextDeposit={
                    (userCircleData.circleData?.circleInfo.currentIndex ||
                      BigInt(0)) +
                      BigInt(1) <
                    (userCircleData.circleData?.totalRounds || BigInt(0))
                      ? userCircleData.circleData?.circleInfo.depositAmount ||
                        BigInt(0)
                      : BigInt(0)
                  }
                  nextDepositAddress={
                    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
                    userCircleData.circleData?.circleInfo.token!
                  }
                  roundsLeft={
                    (userCircleData.circleData?.totalRounds || BigInt(0)) -
                    (userCircleData.circleData?.completedRounds || BigInt(0)) -
                    BigInt(1)
                  }
                />
              ) : (
                <LastClaimStatus address={address} circleId={id} />
              )}
              {userCircleData.circleData?.isMember && (
                <AutomaticClaim stackId={id} disabled={isFailedStack} />
              )}
            </>
          )}
        </>
      )}
    </section>
  );
};

function LastClaimStatus({
  address,
  circleId,
}: {
  address: Address;
  circleId: string;
}) {
  const now = useBlockTimestamp();
  const { data } = useGetLastClaimed({
    circleId,
    accountAddress: address,
    enabled: true,
  });

  if (!data) return null;

  return (
    <Body className="disable-like-btn font-semibold text-paper-main w-full">
      Claimed {formatRelativeTime(data.timestamp, new Date(now))}
    </Body>
  );
}

export default TotalStacked;
