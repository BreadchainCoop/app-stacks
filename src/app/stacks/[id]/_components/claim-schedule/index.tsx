"use client";

import { Body, Heading3 } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react";
import { useGetCircleCreated } from "@/hooks/use-get-cricle-created";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import ClaimScheduleCarousel from "./carousel";
import ClaimScheduleSummary from "./summary";

export type CircleData = Exclude<
  ReturnType<typeof useUserCircleData>["circleData"],
  undefined
>;

const ClaimSchedule = ({ id, circle }: { id: string; circle: CircleData }) => {
  return (
    <section className="bg-paper-0 flex flex-col p-4">
      <header className="flex flex-col gap-4 border-b border-paper-2 pb-4 mb-4 md:flex-row md:items-center md:justify-between">
        <Heading3 className="text-2xl font-bold">Claim schedule</Heading3>
        <div className="flex items-center gap-2">
          <Body className="text-xs text-surface-grey">Created on:</Body>
          <CalendarDotsIcon size={16} className="fill-blue-2" />
          <CircleCreatedAt id={id} />
        </div>
      </header>

      <ClaimScheduleCarousel id={id} circle={circle} />

      <ClaimScheduleSummary id={id} circle={circle} />
    </section>
  );
};

function CircleCreatedAt({ id }: { id: string }) {
  const { data: createdAt } = useGetCircleCreated({ circleId: id });

  return (
    <Body className="text-xs text-surface-ink">
      {createdAt ? new Intl.DateTimeFormat("en-GB").format(createdAt) : "-"}
    </Body>
  );
}

export default ClaimSchedule;
