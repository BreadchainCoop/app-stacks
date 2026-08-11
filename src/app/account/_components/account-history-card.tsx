"use client";

import Loading from "@/app/loading";
import { useAccountHistory } from "@/hooks/use-account-history";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { useUserStacksMetadata } from "@/hooks/use-user-stacks-metadata";
import {
  Body,
  CopyButtonIcon,
  Heading2,
  formatBalance,
  useConnectedUser,
} from "@breadcoop/ui";
import {
  ArrowUpRightIcon,
  HandDepositIcon,
  HandWithdrawIcon,
} from "@phosphor-icons/react";
import { Address, formatEther } from "viem";
import { explorerTxUrl } from "@/utils/network";

const cardClass =
  "border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26] md:p-8";

const AccountHistoryCard = ({ address }: { address: Address }) => {
  const isOwner = useIsOwnAddress(address);
  const { history, isLoading } = useAccountHistory(address);
  const { user } = useConnectedUser();

  // Stack names are member-only info, so resolve them from the *viewer's* own
  // stacks (falls back to "Stack {id}"), matching AccountUserStacks.
  const viewerAddress =
    user.status === "CONNECTED" || user.status === "UNSUPPORTED_CHAIN"
      ? user.address
      : undefined;
  const { getName } = useUserStacksMetadata(viewerAddress);

  return (
    <div className={`flex flex-col gap-6 ${cardClass}`}>
      <Heading2 className="text-xl">Account history</Heading2>

      {isLoading ? (
        <Loading />
      ) : history.length === 0 ? (
        <Body className="text-surface-grey">
          {isOwner
            ? "No account activity yet."
            : "This account has no activity yet."}
        </Body>
      ) : (
        <ul className="flex flex-col gap-4">
          {history.map((entry) => {
            const isDeposit = entry.type === "deposit";
            const stackName = getName(entry.circleId.toString());
            const amount = formatBalance(Number(formatEther(entry.amount)), 2);

            return (
              <li
                key={`${entry.txHash}-${entry.circleId}-${entry.type}`}
                className="flex items-center gap-4"
              >
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-paper-1 text-primary-blue">
                  {isDeposit ? (
                    <HandDepositIcon size={24} weight="fill" />
                  ) : (
                    <HandWithdrawIcon size={24} weight="fill" />
                  )}
                </span>
                <div className="flex min-w-0 flex-col">
                  <Body bold className="text-surface-ink">
                    {isDeposit ? "Deposit" : "Withdrawal"}
                  </Body>
                  <div className="flex items-center gap-2">
                    <Body className="text-surface-grey">
                      {isDeposit
                        ? `Deposited ${amount} BREAD in ${stackName}`
                        : `Withdrew ${amount} BREAD from ${stackName}`}
                    </Body>
                    {entry.txHash && (
                      <>
                        <CopyButtonIcon textToCopy={entry.txHash} />
                        <a
                          href={explorerTxUrl(entry.txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="View transaction on block explorer"
                          className="text-surface-grey transition-colors hover:text-surface-ink"
                        >
                          <ArrowUpRightIcon size={20} />
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default AccountHistoryCard;
