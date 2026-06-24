"use client";

import { Fragment, useRef } from "react";
import { Address } from "viem";
import { Body, Heading3 } from "@breadcoop/ui";
import {
  ArrowRightIcon,
  CalendarDotsIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckCircleIcon,
  CircleIcon,
} from "@phosphor-icons/react";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { usePreferredEnsName } from "@/hooks/use-preferred-ens-name";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { formatAddress } from "@/utils/address";
import { cn } from "@/lib/utils";

type CircleData = NonNullable<
  ReturnType<typeof useUserCircleData>["circleData"]
>;

type TurnStatus = "completed" | "current" | "upcoming";

const SECONDS_PER_DAY = 86_400;

// dd/mm/yyyy, matching the rest of the app (en-GB).
const formatDate = (seconds: number) =>
  new Intl.DateTimeFormat("en-GB").format(new Date(seconds * 1000));

const ClaimSchedule = ({
  id,
  circle,
  member,
  now,
}: {
  id: string;
  circle: CircleData;
  /** The connected member's address. */
  member: Address;
  /** Current time in milliseconds (block timestamp). */
  now: number;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { members, isLoading } = useCircleMembersWithBalances(BigInt(id));

  const { circleInfo } = circle;
  const startTime = Number(circleInfo.effectiveCircleStartTime);
  const interval = Number(circleInfo.depositInterval);
  const currentIndex = Number(circleInfo.currentIndex);
  const nowSeconds = Math.floor(now / 1000);

  // Round i's turn date = circle start + one interval per preceding round.
  const turnDate = (index: number) => startTime + interval * index;

  const turnStatus = (index: number): TurnStatus => {
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "current";
    return "upcoming";
  };

  const scroll = (direction: -1 | 1) =>
    scrollRef.current?.scrollBy({ left: direction * 232, behavior: "smooth" });

  const youIndex = members.findIndex(
    (address) => address.toLowerCase() === member.toLowerCase()
  );

  // "You can claim in": use the contract's per-user nextWithdrawTime when set,
  // otherwise fall back to the start of the member's own round.
  const claimCountdown = (): { value: string; unit: string } => {
    if (youIndex < 0) return { value: "—", unit: "" };
    if (youIndex < currentIndex) return { value: "Claimed", unit: "" };

    const nextWithdraw = Number(circle.nextWithdrawTime);
    const target = nextWithdraw > 0 ? nextWithdraw : turnDate(youIndex);
    const days = Math.max(
      0,
      Math.ceil((target - nowSeconds) / SECONDS_PER_DAY)
    );
    return { value: String(days), unit: days === 1 ? "Day" : "Days" };
  };

  const countdown = claimCountdown();

  return (
    <section className="bg-paper-0 flex flex-col gap-4 p-4 md:p-6">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <Heading3 className="text-2xl leading-[100%]">Claim schedule</Heading3>
        <div className="flex items-center gap-1.5">
          <Body className="text-surface-grey-2">Created on:</Body>
          <CalendarDotsIcon size={20} className="fill-blue-2" />
          <Body className="text-surface-ink">{formatDate(startTime)}</Body>
        </div>
      </header>

      <div className="flex items-center gap-2 border-t border-paper-2 pt-4">
        <button
          type="button"
          aria-label="Scroll schedule left"
          onClick={() => scroll(-1)}
          className="shrink-0 rounded-md border border-surface-ink p-2 transition-colors hover:bg-paper-2"
        >
          <CaretLeftIcon size={20} className="fill-surface-ink" />
        </button>

        <div
          ref={scrollRef}
          className="flex grow items-stretch gap-3 overflow-x-auto scrollbar-hidden py-2"
        >
          {isLoading ? (
            <Body className="text-surface-grey-2 py-8">
              Loading claim schedule…
            </Body>
          ) : (
            members.map((address, index) => {
              const status = turnStatus(index);
              const isCurrent = status === "current";
              const isYou = address.toLowerCase() === member.toLowerCase();

              return (
                <Fragment key={address}>
                  <div
                    className={cn(
                      "relative flex w-36 shrink-0 flex-col items-center gap-2 rounded-xl p-3 pt-7 text-center",
                      isCurrent
                        ? "border-2 border-primary-blue bg-blue-0"
                        : "bg-paper-2"
                    )}
                  >
                    {status === "completed" && (
                      <span className="absolute top-2 flex items-center gap-1 text-xs font-bold text-system-green">
                        <CheckCircleIcon
                          size={16}
                          className="fill-system-green"
                        />
                        Completed
                      </span>
                    )}
                    {status === "current" && (
                      <span className="absolute top-2 flex items-center gap-1 text-xs font-bold text-primary-blue">
                        <CircleIcon size={16} className="fill-primary-blue" />
                        Current turn
                      </span>
                    )}

                    <span
                      className={cn(
                        "text-4xl font-extrabold",
                        status === "upcoming"
                          ? "text-surface-grey-2"
                          : isCurrent
                            ? "text-primary-blue"
                            : "text-surface-ink"
                      )}
                    >
                      #{index + 1}
                    </span>

                    <Body
                      className={cn(
                        "max-w-full truncate",
                        status === "upcoming"
                          ? "text-surface-grey-2"
                          : "text-surface-ink"
                      )}
                    >
                      <ScheduleMemberName address={address} isYou={isYou} />
                    </Body>

                    <span className="flex items-center gap-1 text-sm text-blue-2">
                      <CalendarDotsIcon size={16} className="fill-blue-2" />
                      {formatDate(turnDate(index))}
                    </span>
                  </div>

                  {index < members.length - 1 && (
                    <ArrowRightIcon
                      size={20}
                      className="shrink-0 self-center fill-primary-blue"
                    />
                  )}
                </Fragment>
              );
            })
          )}
        </div>

        <button
          type="button"
          aria-label="Scroll schedule right"
          onClick={() => scroll(1)}
          className="shrink-0 rounded-md border border-surface-ink p-2 transition-colors hover:bg-paper-2"
        >
          <CaretRightIcon size={20} className="fill-surface-ink" />
        </button>
      </div>

      <div className="flex flex-col gap-3 border-t border-paper-2 pt-4 md:flex-row md:gap-4">
        <div className="flex flex-1 items-center justify-between rounded-lg bg-paper-2 px-4 py-3">
          <Body className="text-surface-grey-2">Your claim order</Body>
          <Body className="text-xl font-bold text-surface-ink">
            {youIndex >= 0 ? `#${youIndex + 1}` : "—"}
          </Body>
        </div>
        <div className="flex flex-1 items-center justify-between rounded-lg bg-paper-2 px-4 py-3">
          <Body className="text-surface-grey-2">You can claim in</Body>
          <Body className="text-surface-ink">
            <span className="text-xl font-bold">{countdown.value}</span>
            {countdown.unit ? ` ${countdown.unit}` : ""}
          </Body>
        </div>
      </div>
    </section>
  );
};

function ScheduleMemberName({
  address,
  isYou,
}: {
  address: Address;
  isYou: boolean;
}) {
  const { ensName, isLoading } = usePreferredEnsName({ address });
  const name = isLoading ? "Loading…" : ensName || formatAddress(address);

  return (
    <>
      {name}
      {isYou ? " (You)" : ""}
    </>
  );
}

export default ClaimSchedule;
