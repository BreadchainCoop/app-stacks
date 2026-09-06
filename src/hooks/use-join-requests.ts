import { useQuery } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { Address } from "viem";

export interface JoinRequest {
  id: string;
  wallet_address: string;
  created_at: string;
}

export type OwnJoinRequestStatus = "pending" | "added" | "dismissed" | null;

interface JoinRequestsResult {
  requests: JoinRequest[];
  ownRequestStatus: OwnJoinRequestStatus;
}

/**
 * `requesterAddress` is whichever wallet is asking — pass the circle owner's
 * address to also get back the full pending list (owner-only, per the API),
 * or any other address to just check that address's own request status
 * (`ownRequestStatus`), which anyone can do.
 */
export const useJoinRequests = (
  circleId: string,
  requesterAddress: Address | undefined,
  enabled: boolean
) => {
  const { getAccessToken } = usePrivy();

  return useQuery<JoinRequestsResult>({
    queryKey: ["join-requests", circleId, requesterAddress?.toLowerCase()],
    queryFn: async () => {
      // Only the owner branch needs this — the API verifies it server-side
      // rather than trusting requesterAddress, since a circle's owner
      // address is public.
      const token = await getAccessToken();

      const res = await fetch(
        `/api/stacks/join-request?circleId=${circleId}&requesterWalletAddress=${requesterAddress}`,
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      const body = await res.json();

      if (!res.ok || !body.success) {
        throw new Error(body.error ?? "Failed to load join requests");
      }

      return {
        requests: body.requests,
        ownRequestStatus: body.ownRequestStatus ?? null,
      };
    },
    enabled: enabled && !!requesterAddress,
  });
};
