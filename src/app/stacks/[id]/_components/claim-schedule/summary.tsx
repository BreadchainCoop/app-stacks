"use client";

import { Address } from "viem";
import { Body, useConnectedUser } from "@breadcoop/ui";
import { useReadContract } from "wagmi";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";
import { useCircleMembersWithBalances } from "@/hooks/use-circle-members";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { getDefaultChainId } from "@/utils/chain";
import type { CircleData } from ".";

const SummaryBox = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-1 items-center justify-between bg-paper-1 px-4 py-3">
    <Body className="text-surface-grey-2">{label}</Body>
    <Body bold className="text-2xl text-surface-ink">
      {value}
    </Body>
  </div>
);

const ClaimScheduleSummary = ({
  id,
  circle,
}: {
  id: string;
  circle: CircleData;
}) => {
  const now = useBlockTimestamp();
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address.toLowerCase()
      : undefined;

  const { members } = useCircleMembersWithBalances(BigInt(id));

  // The member's own withdrawal status — drives the "Claimed" value below.
  const { data: userClaimed } = useReadContract({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    functionName: "hasClaimed",
    args: address ? [BigInt(id), address as Address] : undefined,
    chainId: getDefaultChainId(),
    query: { enabled: Boolean(address) },
  });

  const { effectiveCircleStartTime: start, depositInterval } =
    circle.circleInfo;
  const hasStarted = start > BigInt(0);
  const claimDate = (i: number) => start + BigInt(i + 1) * depositInterval;

  const myIndex = address
    ? members.findIndex((m) => m.toLowerCase() === address)
    : -1;

  const claimOrder = myIndex >= 0 ? `#${myIndex + 1}` : "-";

  let claimIn = "-";
  if (myIndex >= 0 && hasStarted) {
    if (userClaimed) {
      claimIn = "Claimed";
    } else if (circle.canWithdraw) {
      claimIn = "Now";
    } else {
      const seconds = Number(claimDate(myIndex)) - Math.floor(now / 1000);
      claimIn = `${Math.max(0, Math.ceil(seconds / 86_400))} Days`;
    }
  }

  return (
    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-paper-2 md:flex-row">
      <SummaryBox label="Your claim order" value={claimOrder} />
      <SummaryBox label="You can claim in" value={claimIn} />
    </div>
  );
};

export default ClaimScheduleSummary;
