import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { useSupabaseClient } from "@/components/providers/supabase";

const profileQueryKey = (privyUserId: string | undefined) => [
  "profile",
  privyUserId,
];

export const useMyProfile = (privyUserId: string | undefined) => {
  const supabase = useSupabaseClient();

  const { data, isLoading } = useQuery({
    queryKey: profileQueryKey(privyUserId),
    queryFn: async () => {
      const res = await fetch(`/api/user?privyUserId=${privyUserId}`);
      if (!res.ok) throw new Error("Failed to fetch user");
      const { id } = await res.json();

      const { data: profile } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", id as string)
        .single();

      return {
        username:
          (profile as { username: string | null } | null)?.username ?? null,
      };
    },
    enabled: !!privyUserId,
  });

  return {
    alias: data?.username ?? null,
    isLoading,
  };
};

export const useSetAlias = (privyUserId: string | undefined) => {
  const { getAccessToken } = usePrivy();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (alias: string) => {
      const token = await getAccessToken();
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ alias }),
      });

      if (!res.ok) {
        const { error } = await res
          .json()
          .catch(() => ({ error: null as string | null }));

        const err = new Error(error ?? "Failed to save alias") as Error & {
          code?: string;
        };
        if (res.status === 409) err.code = "23505";
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileQueryKey(privyUserId) });
    },
  });

  return {
    setAlias: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
};
