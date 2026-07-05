import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useSupabaseClient } from "@/components/providers/supabase";
import { getMemberAliases } from "@/lib/supabase";

const NO_ALIASES: Record<string, string | null> = {};

export const useMemberAliases = (addresses: readonly Address[]) => {
  const supabase = useSupabaseClient();
  const sorted = [...addresses].map((a) => a.toLowerCase()).sort();

  const { data } = useQuery({
    queryKey: ["member-aliases", sorted],
    queryFn: async () => {
      const aliases = await getMemberAliases(supabase, addresses);
      return Object.fromEntries(
        aliases.map((a) => [a.walletAddress.toLowerCase(), a.username])
      ) as Record<string, string | null>;
    },
    enabled: addresses.length > 0,
    staleTime: 60_000,
  });

  return data ?? NO_ALIASES;
};
