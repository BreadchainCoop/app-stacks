"use client";

import { Address } from "viem";
import {
  CopyButtonIcon,
  FormattedDecimalNumber,
  Logo,
  useBreadBalance,
  useConnectedUser,
} from "@breadcoop/ui";
import { ArrowUpRightIcon } from "@phosphor-icons/react";
import { blo } from "blo";
import { cn } from "@/lib/utils";
import LocalButton from "@/components/button";

interface AccountCardMobileProps {
  address: Address;
  displayName?: string;
  onDeposit?: () => void;
  onWithdraw?: () => void;
  claimable?: { amount: string; onClaim: () => void };
  className?: string;
}

const AccountCardMobile = ({
  address,
  displayName,
  onDeposit,
  onWithdraw,
  claimable,
  className,
}: AccountCardMobileProps) => {
  const { BREAD } = useBreadBalance({ address });
  const { user } = useConnectedUser();
  const avatar = blo(address);
  const chain =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.chain
      : undefined;
  const explorer = `${chain?.blockExplorers?.default.url ?? "https://gnosisscan.io"}/address/${address}`;

  return (
    <div
      className={cn(
        "flex w-full flex-col border-[1.8px] border-surface-grey bg-paper-main",
        className
      )}
    >
      <div className="flex items-center justify-center gap-4 border-b-[1.8px] border-surface-grey py-2">
        <img src={avatar} alt="" className="size-6 shrink-0 rounded-full" />
        <span className="text-base font-bold leading-normal text-surface-ink">
          {displayName}
        </span>
        <div className="flex items-center gap-3">
          <CopyButtonIcon textToCopy={address} />
          <a
            href={explorer}
            target="_blank"
            rel="noopener noreferrer"
            className="text-surface-ink"
            aria-label="View on block explorer"
          >
            <ArrowUpRightIcon size={24} />
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center gap-4.5 px-[0.9rem] py-2">
        <FormattedDecimalNumber
          value={BREAD}
          unit="$"
          integralPartClassName="text-[1.8rem]"
          decimalPartClassName="text-[1.35rem]"
        />
        <div className="flex w-full gap-4">
          <LocalButton
            size="sm"
            variant="secondary"
            onClick={onDeposit}
            className="flex-1 font-bold"
          >
            Deposit
          </LocalButton>
          <LocalButton
            size="sm"
            variant="light"
            onClick={onWithdraw}
            className="flex-1 font-bold"
          >
            Withdraw
          </LocalButton>
        </div>
        {claimable && (
          <div className="flex w-full items-center justify-between border border-surface-ink px-2.5 py-1.25">
            <div className="flex items-center gap-2">
              <Logo size={24} color="orange" />
              <span className="text-base font-bold leading-normal text-system-green">
                {claimable.amount}
              </span>
            </div>
            <LocalButton
              size="sm"
              variant="secondary"
              onClick={claimable.onClaim}
              className="font-bold"
            >
              Claim
            </LocalButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountCardMobile;
