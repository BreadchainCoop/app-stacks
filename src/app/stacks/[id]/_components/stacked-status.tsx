"use client";

import { useCircleStatus } from "@/hooks/use-circle-status";
import TotalStacked from "./total-stacked";
import { useUserCircleData } from "@/hooks/use-user-circle-data";
import Overview from "./overview";
import { Address } from "viem";

const StackedStatus = ({
  id,
  circle,
  member,
}: {
  id: string;
  circle: Exclude<
    ReturnType<typeof useUserCircleData>["circleData"],
    undefined
  >;
  member: Address;
}) => {
  const status = useCircleStatus(BigInt(id));

  return (
    <div className="md:flex md:justify-between md:gap-6">
      <TotalStacked id={id} status={status} />
      <Overview circle={circle} member={member} status={status} />
    </div>
  );
};

export default StackedStatus;
