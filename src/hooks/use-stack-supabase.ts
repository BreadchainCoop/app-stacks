import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";

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
  });
};
