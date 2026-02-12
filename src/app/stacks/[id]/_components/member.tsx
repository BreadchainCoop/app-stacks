"use client";

// import { useUserCircleData } from "@/hooks/use-user-circle-data";
import { Chip } from "@breadcoop/ui";

const StackMember = ({ isMember }: { isMember: boolean | undefined }) => {
  // const { circleData } = useUserCircleData({circleId: BigInt(id)});

  // if (!circleData || !circleData.isMember) return null;
  if (!isMember) return null;

  return (
    <Chip className="border-system-green text-system-green bg-paper-main max-w-max hover:border-current">
      Member
    </Chip>
  );
};

export default StackMember;
