import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useSupabaseClient } from "@/components/providers/supabase";

const NO_ALIASES: Record<string, string | null> = {};

export const useMemberAliases = (addresses: readonly Address[]) => {
  const supabase = useSupabaseClient();
  const sorted = [...addresses].map((a) => a.toLowerCase()).sort();

  const { data } = useQuery({
    queryKey: ["member-aliases", sorted],
    queryFn: async () => {
      if (addresses.length === 0) return NO_ALIASES;

      const candidates = [
        ...addresses,
        ...addresses.map((a) => a.toLowerCase()),
      ];

      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, wallet_address")
        .in("wallet_address", candidates);

      if (usersError) throw usersError;

      const userRows = users as
        | { id: string; wallet_address: string | null }[]
        | null;
      if (!userRows || userRows.length === 0) return NO_ALIASES;

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("user_id, username")
        .in(
          "user_id",
          userRows.map((u) => u.id)
        );

      if (profilesError) throw profilesError;

      const profileRows = profiles as
        | { user_id: string; username: string | null }[]
        | null;

      const usernameByUserId = new Map(
        (profileRows ?? []).map((p) => [p.user_id, p.username])
      );

      return Object.fromEntries(
        userRows
          .filter((u) => Boolean(u.wallet_address))
          .map((u) => [
            u.wallet_address!.toLowerCase(),
            usernameByUserId.get(u.id) ?? null,
          ])
      ) as Record<string, string | null>;
    },
    enabled: addresses.length > 0,
    staleTime: 60_000,
  });

  return data ?? NO_ALIASES;
};
