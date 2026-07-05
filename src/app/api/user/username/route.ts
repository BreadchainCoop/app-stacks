import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAddress, isAddress } from "viem";
import { z } from "zod";
import { serverEnv } from "@/lib/envs/server";
import { createErrorResponse } from "../../utils";

// Service-role client (bypasses RLS) — same pattern as /api/onboard and /api/user.
const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

// 3–20 chars: letters, numbers, underscore. Case is preserved for display, but
// uniqueness is enforced case-insensitively (see PATCH).
const usernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username must be at most 20 characters")
  .regex(/^[A-Za-z0-9_]+$/, "Use only letters, numbers, and underscores");

const setBodySchema = z.object({
  privyUserId: z.string().min(1),
  username: usernameSchema,
});

const MAX_ADDRESSES = 100;

/**
 * PATCH — set/update the caller's display username.
 * Body: { privyUserId, username }. Trust model matches the other routes
 * (privyUserId comes from a logged-in Privy session; see /api/onboard).
 */
export async function PATCH(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return createErrorResponse("Invalid JSON in request body");
  }

  const parsed = setBodySchema.safeParse(body);
  if (!parsed.success) {
    return createErrorResponse(
      parsed.error.issues[0]?.message ?? "Invalid request body"
    );
  }
  const { privyUserId, username } = parsed.data;

  const { data: user, error: userErr } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("privy_user_id", privyUserId)
    .single();
  if (userErr || !user) return createErrorResponse("User not found", 404);

  // Case-insensitive uniqueness. `ilike` treats `_` as a wildcard, so it only
  // narrows to a superset — we confirm an exact (lowercased) clash in JS.
  const { data: candidates, error: takenErr } = await supabaseAdmin
    .from("profiles")
    .select("user_id, username")
    .ilike("username", username);
  if (takenErr) {
    console.error("Username uniqueness check failed:", takenErr);
    return createErrorResponse("Failed to check username", 500);
  }
  const clash = (candidates ?? []).find(
    (c) =>
      c.user_id !== user.id &&
      c.username?.toLowerCase() === username.toLowerCase()
  );
  if (clash) return createErrorResponse("That username is already taken", 409);

  const { error: upErr } = await supabaseAdmin.from("profiles").upsert(
    { user_id: user.id, username, updated_at: new Date().toISOString() },
    { onConflict: "user_id" }
  );
  if (upErr) {
    console.error("Failed to save username:", upErr);
    return createErrorResponse("Failed to save username", 500);
  }

  return NextResponse.json({ success: true, username });
}

/**
 * GET — resolve usernames for one or more addresses.
 * Query: ?addresses=0x..,0x..  (or ?address=0x..)
 * Returns: { usernames: { [lowercasedAddress]: username } } (only set ones).
 */
export async function GET(req: NextRequest) {
  const raw =
    req.nextUrl.searchParams.get("addresses") ??
    req.nextUrl.searchParams.get("address");
  if (!raw) return createErrorResponse("addresses query param is required");

  const requested = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_ADDRESSES);
  const valid = requested.filter((a) => isAddress(a));
  if (valid.length === 0) return NextResponse.json({ usernames: {} });

  // Stored casing is unknown (Privy gives checksummed), so match both variants
  // and key the result by lowercased address.
  const variants = Array.from(
    new Set(valid.flatMap((a) => [getAddress(a), a.toLowerCase()]))
  );

  const { data: users, error: usersErr } = await supabaseAdmin
    .from("users")
    .select("id, wallet_address")
    .in("wallet_address", variants);
  if (usersErr) {
    console.error("Failed to resolve users:", usersErr);
    return createErrorResponse("Failed to resolve users", 500);
  }

  const idToAddress = new Map<string, string>();
  for (const u of users ?? []) {
    if (u.wallet_address) idToAddress.set(u.id, u.wallet_address.toLowerCase());
  }

  const usernames: Record<string, string> = {};
  const ids = [...idToAddress.keys()];
  if (ids.length > 0) {
    const { data: profiles, error: profErr } = await supabaseAdmin
      .from("profiles")
      .select("user_id, username")
      .in("user_id", ids);
    if (profErr) {
      console.error("Failed to resolve usernames:", profErr);
      return createErrorResponse("Failed to resolve usernames", 500);
    }
    for (const p of profiles ?? []) {
      const addr = idToAddress.get(p.user_id);
      if (addr && p.username) usernames[addr] = p.username;
    }
  }

  return NextResponse.json({ usernames });
}
