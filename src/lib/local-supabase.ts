"use client";

import { Address } from "viem";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppSupabaseClient, SupabaseInviteLink } from "./supabase";

/**
 * Browser-side replicas of the server API routes for local mode. The deployed
 * site cannot use its service-role key against a developer's localhost
 * Supabase, so these run with the anon key and the permissive local-only RLS
 * policies from supabase/local-rls.sql.
 *
 * Writes go through the untyped client surface (like the server API routes,
 * which also use untyped clients): the app's Database type predates the
 * Relationships-aware supabase-js generics, so typed inserts resolve to
 * `never`. Reads pin their result types explicitly.
 */

const untyped = (client: AppSupabaseClient) =>
  client as unknown as SupabaseClient;

export const localUserId = (address: string) =>
  `local:${address.toLowerCase()}`;

/** Mirrors /api/onboard + /api/user: get-or-create a user for an Anvil account. */
export async function ensureLocalUser(
  client: AppSupabaseClient,
  address: Address
): Promise<{ id: string }> {
  const privyUserId = localUserId(address);

  const { data: existing } = await client
    .from("users")
    .select("id")
    .eq("privy_user_id", privyUserId)
    .maybeSingle<{ id: string }>();

  if (existing) return existing;

  const id = crypto.randomUUID();
  const { error } = await untyped(client)
    .from("users")
    .insert({ id, privy_user_id: privyUserId, wallet_address: address });

  if (error) {
    // Lost a race with a concurrent insert — re-select.
    const { data: retry, error: retryError } = await client
      .from("users")
      .select("id")
      .eq("privy_user_id", privyUserId)
      .single<{ id: string }>();

    if (retryError || !retry) throw error;
    return retry;
  }

  return { id };
}

/** Mirrors POST /api/stacks/metadata. */
export async function createLocalStackMetadata(
  client: AppSupabaseClient,
  params: {
    id: string;
    stackname: string;
    expected_members: number;
    invite_links: SupabaseInviteLink[];
    address: Address;
  }
): Promise<void> {
  const { id, stackname, expected_members, invite_links, address } = params;

  const { error: stackError } = await untyped(client)
    .from("stacks_metadata")
    .insert({ id, stackname, expected_members, invite_links });

  if (stackError) throw stackError;

  const user = await ensureLocalUser(client, address);

  const { error: userStackError } = await untyped(client)
    .from("user_stacks")
    .insert({ user_id: user.id, stack_id: id });

  if (userStackError) throw userStackError;
}

/** Mirrors PATCH /api/stacks/invite. */
export async function redeemLocalInvite(
  client: AppSupabaseClient,
  params: { circleId: string; nonce: string; address: Address }
): Promise<void> {
  const { circleId, nonce, address } = params;

  const { data, error: fetchError } = await client
    .from("stacks_metadata")
    .select("invite_links")
    .eq("id", circleId)
    .single<{ invite_links: SupabaseInviteLink[] }>();

  if (fetchError || !data) throw fetchError ?? new Error("Stack not found");

  const updatedLinks = data.invite_links.map((link) =>
    link.long.includes(`nonce=${nonce}`) ? { ...link, used: true } : link
  );

  const { error: updateError } = await untyped(client)
    .from("stacks_metadata")
    .update({ invite_links: updatedLinks })
    .eq("id", circleId);

  if (updateError) throw updateError;

  const user = await ensureLocalUser(client, address);

  const { error: userStackError } = await untyped(client)
    .from("user_stacks")
    .insert({ user_id: user.id, stack_id: circleId });

  if (userStackError) throw userStackError;
}
