import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";
import { useActiveChainId } from "@/components/providers/active-chain";

const supabase = createSupabaseClient();

export const useUserStacksMetadata = (address: string | undefined) => {
  const chainId = useActiveChainId();
  const { data, isLoading } = useQuery({
    queryKey: ["user-stacks-metadata", chainId, address?.toLowerCase()],
    queryFn: async () => {
      const empty: Record<string, SupabaseStackMetadata> = {};
      if (!address) return empty;

      // .in() is case-sensitive; match both casings
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .in("wallet_address", [address, address.toLowerCase()]);

      if (userError) throw userError;

      const userId = users?.[0]?.id;
      if (!userId) return empty;

      const { data, error } = await supabase
        .from("user_stacks")
        .select("stack_id, stacks_metadata(*)")
        .eq("user_id", userId)
        .eq("chain_id", chainId);

      if (error) throw error;

      // Safe to key on the bare circle id because the query above is scoped to
      // one chain; across chains these ids collide.
      return Object.fromEntries(
        data
          .map(({ stacks_metadata }) => stacks_metadata)
          .filter((meta): meta is SupabaseStackMetadata => Boolean(meta))
          .map((meta) => [meta.id, meta])
      ) as Record<string, SupabaseStackMetadata>;
    },
    enabled: !!address,
  });

  return {
    stacksMap: data ?? {},
    isLoading,
    getName: (id: string) => data?.[id]?.stackname ?? `Stack ${id}`,
    getStack: (id: string) => data?.[id] ?? null,
  };
};
