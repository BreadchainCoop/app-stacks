import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";

type UserStacks = {
  stack_id: string;
  stacks_metadata: SupabaseStackMetadata;
};

const supabase = createSupabaseClient();

export const useUserStacksMetadata = (privyUserId: string | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-stacks-metadata", privyUserId],
    queryFn: async () => {
      const res = await fetch(`/api/user?privyUserId=${privyUserId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const { id } = await res.json();

      const { data, error } = await supabase
        .from("user_stacks")
        .select("stack_id, stacks_metadata(*)")
        .eq("user_id", id);

      if (error) throw error;

      const returned = Object.fromEntries(
        data.map(({ stacks_metadata }: UserStacks) => [
          stacks_metadata.id,
          stacks_metadata,
        ])
      ) as Record<string, SupabaseStackMetadata>;

      return returned;
    },
    enabled: !!privyUserId,
  });

  return {
    stacksMap: data ?? {},
    isLoading,
    getName: (id: string) => data?.[id]?.stackname ?? `Stack ${id}`,
    getStack: (id: string) => data?.[id] ?? null,
  };
};
