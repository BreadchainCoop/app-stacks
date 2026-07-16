import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserIdentity } from "@/components/providers/user-identity";
import { useSupabaseClient } from "@/components/providers/supabase";
import { getProfile } from "@/lib/supabase";

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

      const { data, error } = await getProfile(supabase, id);

      if (error) throw error;

      return { username: data?.username ?? null };
    },
    enabled: !!privyUserId,
  });

  return {
    alias: data?.username ?? null,
    isLoading,
  };
};

export const useSetAlias = (privyUserId: string | undefined) => {
  const { getAuthToken } = useUserIdentity();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (alias: string) => {
      // Writes go through our API route: it verifies the bearer token and
      // uses the service role, since the browser client is anonymous.
      const token = await getAuthToken();
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
