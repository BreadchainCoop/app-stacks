"use client";

import { Body, CopyButtonIcon } from "@breadcoop/ui";
import { ArrowUpRightIcon, UserCircleIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { Address } from "viem";
import { useModal } from "@/components/modal/context";
import { useMyProfile } from "@/hooks/use-my-profile";
import { useMemberAlias } from "@/hooks/use-member-aliases";
import { useIsOwnAddress } from "@/hooks/use-is-own-address";
import { formatAddress } from "@/utils/address";
import { explorerAddressUrl } from "@/utils/network";

const AccountProfileCard = ({ address }: { address: Address }) => {
  const isOwner = useIsOwnAddress(address);
  const { user: privyUser } = usePrivy();
  const { setModal } = useModal();

  // Own alias comes from the profile query (fresh after edits); other members'
  // from the public wallet -> alias lookup. Mirrors the old ProfileSection.
  const myProfile = useMyProfile(isOwner ? privyUser?.id : undefined);
  const memberAlias = useMemberAlias(isOwner ? undefined : address);

  const alias = isOwner ? myProfile.alias : memberAlias.alias;
  const isLoading = isOwner && myProfile.isLoading;

  return (
    <div className="flex items-center gap-4 border border-paper-1 bg-paper-0 p-6 shadow-[0px_4px_12px_0px_#1B201A26]">
      <UserCircleIcon size={56} className="shrink-0 text-primary-blue" />
      <div className="flex min-w-0 flex-col gap-1">
        <Body className="text-surface-grey">Username</Body>
        <div className="flex items-center gap-2">
          <Body bold className="text-lg text-surface-ink">
            {isLoading ? "Loading..." : alias || "Not set"}
          </Body>
          {isOwner && (
            <button
              type="button"
              onClick={() => setModal({ type: "SET_ALIAS" })}
              className="text-sm font-bold text-primary-blue hover:underline"
            >
              {alias ? "Edit" : "Set"}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Body className="text-surface-grey">{formatAddress(address)}</Body>
          <CopyButtonIcon textToCopy={address} />
          <a
            href={explorerAddressUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on block explorer"
            className="text-surface-grey transition-colors hover:text-surface-ink"
          >
            <ArrowUpRightIcon size={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AccountProfileCard;
