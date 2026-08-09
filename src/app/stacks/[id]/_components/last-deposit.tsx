"use client";

import { ICircleStatus } from "@/interfaces/circle";
import { savingCirclesAbi } from "@/lib/abis/saving-circles";
import { SAVING_CIRCLES_CONTRACT_ADDRESS } from "@/lib/constants";
import { Body } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react";
import { useWatchContractEvent, usePublicClient } from "wagmi";
import { getDefaultChainId } from "@/utils/chain";
import { useState } from "react";
import { useGetLastDeposit } from "@/hooks/use-get-last-deposit";
import { formatRelativeTime } from "@/utils/time";
import { useBlockTimestamp } from "@/hooks/use-block-timestamp";

interface LastDepositProps {
  id: string;
  status: ICircleStatus | null;
  isActive?: boolean;
}

const LastDeposit = ({ id, status, isActive }: LastDepositProps) => {
  const now = useBlockTimestamp();
  const { lastDepositTime: _lastDepositTime } = useGetLastDeposit({
    circleId: id,
    enabled: Boolean(isActive),
  });
  const [lastDepositTime, setLastDepositTime] = useState<Date | null>(null);
  const publicClient = usePublicClient({ chainId: getDefaultChainId() });

  useWatchContractEvent({
    address: SAVING_CIRCLES_CONTRACT_ADDRESS,
    abi: savingCirclesAbi,
    chainId: getDefaultChainId(),
    eventName: "FundsDeposited",
    args: { id: BigInt(id) },
    onLogs: async (logs) => {
      if (logs.length > 0 && publicClient) {
        const lastLog = logs[logs.length - 1];
        const block = await publicClient.getBlock({
          blockNumber: lastLog.blockNumber,
        });
        setLastDepositTime(new Date(Number(block.timestamp) * 1000));
      }
    },
  });

  const lastestDepositTime = _lastDepositTime || lastDepositTime;

  return (
    <div className="flex items-center justify-center gap-1 text-xs">
      <Body className="text-surface-grey">Last deposit:</Body>
      <div className="inline-flex items-center justify-start">
        <CalendarDotsIcon size={16} className="fill-blue-2 mr-1" />
        <Body className="text-surface-ink">
          {status === "finished"
            ? "Ended"
            : lastestDepositTime
              ? formatRelativeTime(lastestDepositTime, new Date(now))
              : "-"}
        </Body>
      </div>
    </div>
  );
};

export default LastDeposit;
