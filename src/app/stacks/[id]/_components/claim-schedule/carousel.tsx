"use client";

import { ReactNode, useEffect, useState } from "react";
import { Address } from "viem";
import { Body, useConnectedUser } from "@breadcoop/ui";
import {
  ArrowRightIcon,
  CalendarDotsIcon,
  CheckSquareIcon,
} from "@phosphor-icons/react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/carousel";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { useFundsDeposited } from "@/hooks/use-funds-deposited";
import { DisplayName } from "@/components/display-name";
import { cn } from "@/lib/utils";
import type { CircleData } from ".";

type RoundState = "completed" | "current" | "upcoming";

interface ScheduleRound {
  round: number;
  memberAddress: Address;
  isYou: boolean;
  dateLabel: string;
  state: RoundState;
}

const formatDate = (seconds: bigint) =>
  new Intl.DateTimeFormat("en-GB").format(new Date(Number(seconds) * 1000));

const RoundCardExtraInfo = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center gap-1 text-xs font-bold absolute top-[-0.6rem] w-full max-w-max bg-paper-main p-0.5">
    {children}
  </div>
);

const RoundCard = ({
  round,
  memberAddress,
  isYou,
  dateLabel,
  state,
}: ScheduleRound) => (
  <div
    className={cn(
      "relative shrink-0 w-38.5 h-38.5 flex flex-col items-center justify-center gap-1 p-4 border",
      state === "current"
        ? "border-primary-blue bg-blue-0"
        : "border-transparent bg-paper-1"
    )}
  >
    {state === "completed" && (
      <RoundCardExtraInfo>
        <CheckSquareIcon size={14} className="text-system-green" />
        <span className="text-system-green">Completed</span>
      </RoundCardExtraInfo>
    )}
    {state === "current" && (
      <RoundCardExtraInfo>
        <div className="bg-blue-0 border border-primary-blue w-3 h-3 rounded-[50%]" />
        <span className="text-primary-blue">Current turn</span>
      </RoundCardExtraInfo>
    )}
    <p
      className={`text-h2 text-[2.5rem] ${state === "current" ? "text-blue-2" : state === "upcoming" ? "text-surface-grey" : "text-surface-ink"}`}
    >
      #{round}
    </p>
    <Body
      className={`text-xs text-center ${state === "upcoming" ? "text-surface-grey" : "text-surface-ink"}`}
    >
      <DisplayName address={memberAddress} link={false} />
      {isYou ? " (You)" : ""}
    </Body>
    <div className="flex items-center gap-1">
      <CalendarDotsIcon size={14} className="fill-blue-2" />
      <Body
        className={`text-xs ${state === "completed" ? "text-surface-grey-2" : "text-blue-2"}`}
      >
        {dateLabel}
      </Body>
    </div>
  </div>
);

const ClaimScheduleCarousel = ({
  id,
  circle,
}: {
  id: string;
  circle: CircleData;
}) => {
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address.toLowerCase()
      : undefined;

  const { members, isLoading } = useCircleMembersWithBalances(BigInt(id));

  const { effectiveCircleStartTime: start, depositInterval } =
    circle.circleInfo;
  const hasStarted = start > BigInt(0);
  const claimDate = (i: number) => start + BigInt(i + 1) * depositInterval;

  const totalRounds = members.length;
  // The active round = how many rounds have had *all* members deposit
  // (lastActiveRound, from the FundsDeposited logs). This is the true round
  // progression: the time-based currentIndex runs away once windows pass, and
  // claims lag behind. Rounds before it are completed, the round at it is current
  // (the round in play, or where a failed circle stopped), after = upcoming.
  const { data: fundsDeposited, isLoading: isLoadingFunds } = useFundsDeposited(
    {
      circleId: id,
      enabled: hasStarted && totalRounds > 0,
      totalRounds,
      circleStartsTimestamp: start,
      depositInterval,
    }
  );
  const activeRound = hasStarted ? (fundsDeposited?.lastActiveRound ?? -1) : -1;

  const stateFor = (i: number): RoundState =>
    i < activeRound ? "completed" : i === activeRound ? "current" : "upcoming";

  const rounds: ScheduleRound[] = members.map((member, i) => ({
    round: i + 1,
    memberAddress: member as Address,
    isYou: member.toLowerCase() === address,
    dateLabel: hasStarted ? formatDate(claimDate(i)) : "-",
    state: stateFor(i),
  }));

  const [api, setApi] = useState<CarouselApi>();
  // Show the nav only when items actually overflow. Embla re-emits "reInit" on
  // resize, so this stays correct when the viewport shrinks and items overflow.
  const [showNav, setShowNav] = useState(false);

  useEffect(() => {
    if (!api) return;
    const update = () => setShowNav(api.canScrollPrev() || api.canScrollNext());
    update();
    api.on("reInit", update);
    api.on("select", update);
    return () => {
      api.off("reInit", update);
      api.off("select", update);
    };
  }, [api]);

  if (isLoading || (hasStarted && isLoadingFunds)) {
    return <Body className="text-surface-grey-2">Loading claim schedule…</Body>;
  }

  return (
    <Carousel
      opts={{ align: "start" }}
      setApi={setApi}
      className={cn(showNav && "px-10")}
    >
      <CarouselContent className="pt-3">
        {rounds.map((round, i) => (
          <CarouselItem key={round.round} className="basis-auto">
            <div className="flex items-center gap-3">
              <RoundCard {...round} />
              {i < rounds.length - 1 && (
                <ArrowRightIcon
                  size={20}
                  className="shrink-0 text-primary-blue"
                />
              )}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {showNav && (
        <>
          <CarouselPrevious className="left-0 z-10" />
          <CarouselNext className="right-0 z-10" />
        </>
      )}
    </Carousel>
  );
};

export default ClaimScheduleCarousel;
