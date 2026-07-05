import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";

type UsernameMap = Record<string, string>;

async function fetchUsernames(addresses: string[]): Promise<UsernameMap> {
  if (addresses.length === 0) return {};
  const res = await fetch(
    `/api/user/username?addresses=${encodeURIComponent(addresses.join(","))}`
  );
  if (!res.ok) return {};
  const json = (await res.json()) as { usernames?: UsernameMap };
  return json.usernames ?? {};
}

/**
 * Resolve Supabase display usernames for a set of addresses. Returns a map
 * keyed by lowercased address; addresses without a username are simply absent.
 */
export function useUsernames(addresses: (Address | undefined)[]) {
  const list = Array.from(
    new Set(
      addresses
        .filter((a): a is Address => Boolean(a))
        .map((a) => a.toLowerCase())
    )
  ).sort();

  const query = useQuery({
    queryKey: ["usernames", list],
    queryFn: () => fetchUsernames(list),
    enabled: list.length > 0,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return { usernames: query.data ?? {}, isLoading: query.isLoading };
}

/** Single-address convenience wrapper around {@link useUsernames}. */
export function useUsername(address?: Address) {
  const { usernames, isLoading } = useUsernames(address ? [address] : []);
  return {
    username: address ? usernames[address.toLowerCase()] : undefined,
    isLoading,
  };
}
