"use client";

import Link from "next/link";
import { Address } from "viem";
import { usePreferredEnsName } from "@/hooks/use-preferred-ens-name";
import { useMemberAlias } from "@/hooks/use-member-aliases";
import { formatAddress } from "@/utils/address";

/**
 * Resolve an address to its best human-readable label:
 *   Supabase alias  ->  ENS name  ->  truncated 0x… address
 *
 * The alias is looked up per address and shared through the query cache, so
 * rendering a list of these costs one batched round-trip, not one per member.
 * Pass `alias` only when the caller has a better source than that public
 * lookup — the connected user reads their own alias from `useMyProfile`, which
 * is keyed on the Privy id and so stays right after an edit.
 *
 * `usePreferredEnsName` already falls back to `formatAddress` internally, so
 * `displayName` is always a usable string; while ENS resolves we surface the
 * truncated address immediately rather than a "Loading…" placeholder to avoid
 * a flash / layout shift.
 */
export function useDisplayName(
  address: Address | undefined,
  override?: { alias: string | null; isLoading: boolean }
) {
  const resolved = useMemberAlias(override ? undefined : address);

  const alias = override ? override.alias : resolved.alias;
  const isAliasLoading = override ? override.isLoading : resolved.isLoading;

  // Skip the ENS lookup unless it can still win. It costs up to seven network
  // round-trips (Gnosis coinType, L1, then the L2s), and it is discarded both
  // when an alias exists and when one is still on its way in.
  const { ensName, isLoading: isEnsLoading } = usePreferredEnsName({
    address: alias || isAliasLoading ? undefined : address,
  });

  const displayName = !address
    ? "N/A"
    : alias || ensName || formatAddress(address);

  return {
    displayName,
    alias,
    isLoading: isAliasLoading || (isEnsLoading && !alias),
  };
}

/**
 * Renders the best human-readable label for an address. By default it links to
 * the account page (matching the members-list behaviour); pass `link={false}`
 * for contexts that shouldn't navigate (e.g. the account page itself).
 */
export function DisplayName({
  address,
  link = true,
  className,
}: {
  address: Address;
  /** Wrap in a link to the account page (default true). */
  link?: boolean;
  className?: string;
}) {
  const { displayName } = useDisplayName(address);

  const label = (
    <span
      className={`inline-flex items-center justify-start ${className ?? ""}`}
    >
      {displayName}
    </span>
  );

  if (!link) return label;

  return (
    <Link
      href={`/account/${address}`}
      className="hover:text-primary-blue"
      onClick={(e) => e.stopPropagation()}
    >
      {label}
    </Link>
  );
}

export default DisplayName;
