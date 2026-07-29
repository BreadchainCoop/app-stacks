"use client";

import Link from "next/link";
import { Address } from "viem";
import { usePreferredEnsName } from "@/hooks/use-preferred-ens-name";
import { useMemberAliases } from "@/hooks/use-member-aliases";
import { formatAddress } from "@/utils/address";

const NO_ADDRESSES: Address[] = [];

/**
 * Resolve an address to its best human-readable label:
 *   Supabase alias  ->  ENS name  ->  truncated 0x… address
 *
 * Pass `aliasOverride` (a string or null) when the caller already has the
 * alias in hand — e.g. a list that fetched `useMemberAliases` in bulk — to
 * avoid a redundant per-address Supabase round-trip. Passing `undefined`
 * (the default) makes the hook resolve the alias itself.
 *
 * `usePreferredEnsName` already falls back to `formatAddress` internally, so
 * `displayName` is always a usable string; while ENS resolves we surface the
 * truncated address immediately rather than a "Loading…" placeholder to avoid
 * a flash / layout shift.
 */
export function useDisplayName(
  address: Address | undefined,
  aliasOverride?: string | null
) {
  const shouldFetchAlias = aliasOverride === undefined && Boolean(address);
  const aliases = useMemberAliases(
    shouldFetchAlias ? [address as Address] : NO_ADDRESSES
  );

  const alias =
    aliasOverride !== undefined
      ? aliasOverride
      : address
        ? (aliases[address.toLowerCase()] ?? null)
        : null;

  // Skip the ENS lookup once an alias has won: it costs up to seven network
  // round-trips (Gnosis coinType, L1, then the L2s) and the result is discarded.
  const { ensName, isLoading } = usePreferredEnsName({
    address: alias ? undefined : address,
  });

  const displayName = !address
    ? "N/A"
    : alias || ensName || formatAddress(address);

  return { displayName, alias, isLoading: isLoading && !alias };
}

/**
 * Renders the best human-readable label for an address. By default it links to
 * the account page (matching the members-list behaviour); pass `link={false}`
 * for contexts that shouldn't navigate (e.g. the account page itself).
 */
export function DisplayName({
  address,
  alias,
  link = true,
  className,
}: {
  address: Address;
  /** Pre-resolved alias (string or null) to skip the per-address lookup. */
  alias?: string | null;
  /** Wrap in a link to the account page (default true). */
  link?: boolean;
  className?: string;
}) {
  const { displayName } = useDisplayName(address, alias);

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
