import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@/components/providers/supabase";

export const useHasTransferredToWallet = (privyUserId: string | undefined) => {
  const supabase = useSupabaseClient();

  const query = useQuery({
    queryKey: ["has-transferred-to-wallet", privyUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("transferred_to_wallet_at")
        .eq("privy_user_id", privyUserId as string)
        .single();

      if (error) throw error;
      return data.transferred_to_wallet_at !== null;
    },
    enabled: !!privyUserId,
  });

  return query;
};

export const useInvalidateHasTransferredToWallet = () => {
  const queryClient = useQueryClient();

  return (privyUserId: string | undefined) =>
    queryClient.invalidateQueries({
      queryKey: ["has-transferred-to-wallet", privyUserId],
    });
};
