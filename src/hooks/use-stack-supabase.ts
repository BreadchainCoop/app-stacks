import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";
import { isLocalMode } from "@/lib/network-mode";

const supabase = createSupabaseClient();

export const useStackSupabase = (id: string, enabled?: boolean) => {
  return useQuery<SupabaseStackMetadata>({
    queryKey: ["stack-metadata", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stacks_metadata")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: enabled ?? true,
    // Local supabase is optional; when it isn't running, fail fast so the UI
    // falls back to on-chain data instead of retrying a dead localhost.
    retry: isLocalMode() ? false : undefined,
  });
};
