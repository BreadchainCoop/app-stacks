import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAddress, isAddress } from "viem";
import { serverEnv } from "@/lib/envs/server";
import type { Database } from "@/lib/supabase";
import { ALIAS_MAX_LENGTH, ALIAS_MIN_LENGTH } from "@/lib/alias";
import { createErrorResponse, verifyUserToken } from "../../utils";

// Least privilege: aliases and wallet addresses are already readable by the
// anon role (see the member_alias migration), so search never needs the
// service-role key.
const supabase = createClient<Database>(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const MAX_RESULTS = 8;

// A query is a (partial) alias, optionally prefixed with "@". Aliases are
// letters, digits and "_", so anything else can't match and is rejected.
const QUERY_PATTERN = /^[a-zA-Z][a-zA-Z0-9_]*$/;

export type UserSearchResult = { username: string; address: string };

/**
 * Finds users by alias prefix for the person picker. Signed-in callers only,
 * prefix match only, capped results: aliases are public, but this keeps the
 * endpoint from being a convenient way to page through every user.
 */
export async function GET(req: NextRequest) {
  const privyUserId = await verifyUserToken(req);
  if (!privyUserId) return createErrorResponse("Unauthorized", 401);

  const query = (req.nextUrl.searchParams.get("q") ?? "")
    .trim()
    .replace(/^@/, "");

  if (
    query.length < ALIAS_MIN_LENGTH ||
    query.length > ALIAS_MAX_LENGTH ||
    !QUERY_PATTERN.test(query)
  ) {
    return NextResponse.json({ users: [] satisfies UserSearchResult[] });
  }

  // "_" is a LIKE wildcard; escape it so it only matches a literal underscore
  const pattern = `${query.replace(/_/g, "\\_")}%`;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, users!inner(wallet_address)")
    .ilike("username", pattern)
    .not("users.wallet_address", "is", null)
    .order("username")
    .limit(MAX_RESULTS);

  if (error) {
    console.error("User search failed:", error);
    return createErrorResponse("Search failed", 500);
  }

  const users: UserSearchResult[] = (data ?? []).flatMap((row) => {
    const address = row.users?.wallet_address;
    if (!row.username || !address || !isAddress(address)) return [];
    return [{ username: row.username, address: getAddress(address) }];
  });

  return NextResponse.json({ users });
}
