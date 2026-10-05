import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";
import { useActiveChainId } from "@/components/providers/active-chain";

const supabase = createSupabaseClient();

export const useStackSupabase = (id: string, enabled?: boolean) => {
  const chainId = useActiveChainId();
  return useQuery<SupabaseStackMetadata>({
    queryKey: ["stack-metadata", chainId, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stacks_metadata")
        .select("*")
        .eq("chain_id", chainId)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: enabled ?? true,
  });
};
