import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { MEMBER_ALIAS_KEY } from "./use-member-aliases";

const profileQueryKey = (privyUserId: string | undefined) => [
  "profile",
  privyUserId,
];

export const useMyProfile = (privyUserId: string | undefined) => {
  const { data, isLoading } = useQuery({
    queryKey: profileQueryKey(privyUserId),
    queryFn: async () => {
      const res = await fetch(
        `/api/user?privyUserId=${encodeURIComponent(privyUserId!)}`
      );
      if (!res.ok) throw new Error("Failed to fetch user");

      const { username } = await res.json();

      return { username: (username as string | null) ?? null };
    },
    enabled: !!privyUserId,
    // Only this browser changes it, and `useSetAlias` invalidates on write —
    // without this the navbar refetches it on every mount.
    staleTime: Infinity,
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
      // Writes go through our API route: it verifies the Privy token and
      // uses the service role, since the browser client is anonymous.
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
      // The public wallet -> alias lookup backs every other `DisplayName` on
      // screen, including the account header sitting right above the editor.
      queryClient.invalidateQueries({ queryKey: [MEMBER_ALIAS_KEY] });
    },
  });

  return {
    setAlias: mutation.mutateAsync,
    isSaving: mutation.isPending,
  };
};
