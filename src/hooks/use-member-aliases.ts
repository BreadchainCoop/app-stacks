import { useQuery } from "@tanstack/react-query";
import { Address, getAddress } from "viem";
import { useSupabaseClient } from "@/components/providers/supabase";
import { AppSupabaseClient, getMemberAliases } from "@/lib/supabase";

/** Invalidate this prefix to refresh every resolved alias. */
export const MEMBER_ALIAS_KEY = "member-alias";

const memberAliasQueryKey = (address: string) => [
  MEMBER_ALIAS_KEY,
  address.toLowerCase(),
];

// Each alias is cached under its own address so a lone `DisplayName` and a list
// of them share cache entries instead of each keying on the set they happened
// to ask for. To keep that from turning a list into one round-trip per member,
// addresses requested in the same tick are collected and resolved together.
type PendingLookup = {
  address: string;
  resolve: (alias: string | null) => void;
  reject: (error: unknown) => void;
};

let pending: PendingLookup[] = [];
let flushScheduled = false;

const flush = async (client: AppSupabaseClient) => {
  const batch = pending;
  pending = [];
  flushScheduled = false;

  try {
    // `users.wallet_address` is stored checksummed and `.in()` is
    // case-sensitive, so ask with the checksummed form — `getMemberAliases`
    // adds the lowercase variant itself. Asking with the lowercase key would
    // match nothing.
    const rows = await getMemberAliases(client, [
      ...new Set(batch.map((lookup) => getAddress(lookup.address))),
    ]);

    const byAddress = new Map(
      rows.map((row) => [row.walletAddress.toLowerCase(), row.username])
    );

    batch.forEach((lookup) =>
      lookup.resolve(byAddress.get(lookup.address) ?? null)
    );
  } catch (error) {
    batch.forEach((lookup) => lookup.reject(error));
  }
};

const fetchAlias = (client: AppSupabaseClient, address: string) =>
  new Promise<string | null>((resolve, reject) => {
    pending.push({ address: address.toLowerCase(), resolve, reject });

    if (flushScheduled) return;

    flushScheduled = true;
    // A task rather than a microtask: sibling components start their queries
    // from separate effect callbacks, all within the same commit's flush.
    setTimeout(() => flush(client), 0);
  });

/** Resolves one address to its Supabase alias; `null` when none is set. */
export const useMemberAlias = (address: Address | undefined) => {
  const supabase = useSupabaseClient();

  const { data, isLoading } = useQuery({
    queryKey: memberAliasQueryKey(address ?? ""),
    queryFn: () => fetchAlias(supabase, address!),
    enabled: !!address,
    staleTime: 60_000,
  });

  return { alias: data ?? null, isLoading };
};
