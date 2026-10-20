import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { getAddress } from "viem";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

/** An onboarding failure whose message is safe to return to the client. */
export class OnboardError extends Error {}

/**
 * Creates the users and profiles rows for a wallet-host user (MiniPay, Nimiq
 * Pay) — users with no Privy account, identified by an external id such as
 * "minipay:<address>" — mirroring what /api/onboard does for Privy logins.
 * Idempotent: an existing user is left as is.
 */
export const onboardExternalUser = async (
  externalUserId: string,
  address: string
): Promise<{ isNewUser: boolean }> => {
  const { data: existingUser, error: lookupError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("privy_user_id", externalUserId)
    .maybeSingle();

  if (lookupError) {
    console.error("Failed to look up user:", lookupError);
    throw new OnboardError("Failed to look up user");
  }

  const isNewUser = !existingUser;
  let userId = existingUser?.id;

  if (!userId) {
    const { error: userError } = await supabaseAdmin.from("users").upsert(
      {
        id: crypto.randomUUID(),
        privy_user_id: externalUserId,
        wallet_address: getAddress(address),
      },
      { onConflict: "privy_user_id", ignoreDuplicates: true }
    );

    if (userError) {
      console.error("Failed to upsert user:", userError);
      throw new OnboardError("Failed to create user");
    }

    // Fetch the actual id — differs if a concurrent request won the upsert
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("privy_user_id", externalUserId)
      .single();

    if (fetchError || !user) {
      console.error("Failed to fetch user:", fetchError);
      throw new OnboardError("Failed to fetch user");
    }

    userId = user.id;
  }

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .upsert(
      { user_id: userId },
      { onConflict: "user_id", ignoreDuplicates: true }
    );

  if (profileError) {
    console.error("Failed to upsert profile:", profileError);
    throw new OnboardError("Failed to create profile");
  }

  return { isNewUser };
};
