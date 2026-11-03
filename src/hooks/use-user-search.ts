import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useUserIdentity } from "@/components/providers/user-identity";
import { ALIAS_MIN_LENGTH } from "@/lib/alias";
import type { UserSearchResult } from "@/app/api/users/search/route";

const DEBOUNCE_MS = 250;

/** A partial alias worth searching for: 3+ alias characters, "@" optional. */
export const isAliasQuery = (value: string) =>
  /^@?[a-zA-Z][a-zA-Z0-9_]*$/.test(value) &&
  value.replace(/^@/, "").length >= ALIAS_MIN_LENGTH;

/**
 * Users whose alias starts with `query` (debounced). Needs a signed-in user,
 * since /api/users/search only answers authenticated callers.
 */
export const useUserSearch = (query: string) => {
  const { userId, getAuthToken } = useUserIdentity();
  const trimmed = query.trim();
  const [debounced, setDebounced] = useState(trimmed);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(trimmed), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [trimmed]);

  const enabled = !!userId && isAliasQuery(debounced);

  const result = useQuery({
    queryKey: ["user-search", debounced.toLowerCase()],
    enabled,
    staleTime: 30_000,
    retry: 1,
    queryFn: async () => {
      const token = await getAuthToken();
      if (!token) throw new Error("Not signed in");

      const res = await fetch(
        `/api/users/search?q=${encodeURIComponent(debounced)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Search failed");

      const body = (await res.json()) as { users: UserSearchResult[] };
      return body.users.map((u) => ({
        username: u.username,
        address: u.address as Address,
      }));
    },
  });

  return {
    ...result,
    signedIn: !!userId,
    // Still typing, or the debounced request is in flight
    isSearching: enabled && (trimmed !== debounced || result.isFetching),
  };
};
