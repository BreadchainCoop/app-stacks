import { useGetLastClaimed } from "@/hooks/use-get-last-claimed";
import { useIsMiniPay } from "@/components/providers/is-minipay";
import { useMemberAliases } from "@/hooks/use-member-aliases";
import { Body, useConnectedUser } from "@breadcoop/ui";
import { CalendarDotsIcon } from "@phosphor-icons/react";

const LastClaim = ({
  id,
  effectiveCircleStartTime,
}: {
  id: string;
  effectiveCircleStartTime: bigint | undefined;
}) => {
  const { user } = useConnectedUser();
  const address =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;

  const { data } = useGetLastClaimed({
    circleId: id,
    enabled:
      Boolean(effectiveCircleStartTime) &&
      effectiveCircleStartTime !== BigInt(0),
  });

  // MiniPay submission rules forbid raw addresses as the primary identifier;
  // elsewhere keep the existing truncated-address display
  const isMiniPay = useIsMiniPay();
  const aliases = useMemberAliases(
    isMiniPay && data?.memberAddress ? [data.memberAddress] : []
  );
  const alias =
    isMiniPay && data?.memberAddress
      ? aliases[data.memberAddress.toLowerCase()]
      : null;

  return (
    <div className="flex items-center justify-between flex-wrap mb-4.25">
      <Body>Last claim:</Body>
      {data ? (
        <>
          <Body bold className="text-blue-2">
            {/* 0x67e567... (you) */}
            {alias ??
              `${data.memberAddress?.slice(0, 6)}...${data.memberAddress?.slice(-4)}`}{" "}
            <>
              {address?.toLowerCase() === data.memberAddress?.toLowerCase()
                ? "(you)"
                : ""}
            </>
          </Body>
          <div className="flex items-center justify-center gap-1">
            <CalendarDotsIcon size={16} className="fill-blue-2 shrink-0" />
            <Body className="text-xs text-surface-ink">
              {new Intl.DateTimeFormat("en-GB").format(data.timestamp)}
            </Body>
          </div>
        </>
      ) : (
        <Body>-</Body>
      )}
    </div>
  );
};

export default LastClaim;
