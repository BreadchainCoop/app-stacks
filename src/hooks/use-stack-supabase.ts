import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";
import { getLocalStackMetadata } from "@/lib/local-metadata";
import { isLocalMode } from "@/lib/network-mode";

const supabase = createSupabaseClient();

export const useStackSupabase = (id: string, enabled?: boolean) => {
  return useQuery<SupabaseStackMetadata>({
    queryKey: ["stack-metadata", id],
    queryFn: async () => {
      if (isLocalMode()) {
        const local = getLocalStackMetadata(id);
        if (!local) throw new Error(`No local metadata for stack ${id}`);
        return local;
      }

      const { data, error } = await supabase
        .from("stacks_metadata")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: enabled ?? true,
    // A localStorage miss is definitive (a stack created in another browser),
    // so don't retry it - the UI falls back to on-chain data right away.
    retry: isLocalMode() ? false : undefined,
  });
};
