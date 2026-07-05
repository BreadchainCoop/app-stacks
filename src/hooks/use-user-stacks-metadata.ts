import { useQuery } from "@tanstack/react-query";
import { createSupabaseClient, SupabaseStackMetadata } from "@/lib/supabase";
import { isLocalMode } from "@/lib/network-mode";

type UserStacks = {
  stack_id: string;
  stacks_metadata: SupabaseStackMetadata;
};

const supabase = createSupabaseClient();

export const useUserStacksMetadata = (privyUserId: string | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: ["user-stacks-metadata", privyUserId],
    queryFn: async () => {
      let id: string;

      if (isLocalMode()) {
        // No API routes in local mode: look the user up directly.
        const { data: user, error } = await supabase
          .from("users")
          .select("id")
          .eq("privy_user_id", privyUserId!)
          .single<{ id: string }>();

        if (error || !user) throw new Error("Failed to fetch user");
        id = user.id;
      } else {
        const res = await fetch(`/api/user?privyUserId=${privyUserId}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        ({ id } = await res.json());
      }

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
    // Local supabase is optional; when it isn't running, fail fast so the UI
    // falls back to on-chain data instead of retrying a dead localhost.
    retry: isLocalMode() ? false : undefined,
  });

  return {
    stacksMap: data ?? {},
    isLoading,
    getName: (id: string) => data?.[id]?.stackname ?? `Stack ${id}`,
    getStack: (id: string) => data?.[id] ?? null,
  };
};
