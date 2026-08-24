"use client";

import { Address } from "viem";
import { SupabaseInviteLink, SupabaseStackMetadata } from "./supabase";

/**
 * Local mode's stand-in for the off-chain data the hosted app keeps in
 * Supabase: stack names, invite links and which stacks a wallet belongs to.
 *
 * It lives in localStorage rather than a database because local mode has
 * neither of the two things the hosted flow relies on: the API routes can't
 * reach a developer's machine (the deployed site would be calling its own
 * server), and there is no Privy identity to attribute writes to. Keeping it
 * in the browser also means local mode needs nothing but Anvil - no Supabase
 * CLI, no Docker, no env vars.
 *
 * One store per browser, with membership tracked per Anvil account, so
 * switching accounts in the navbar behaves like switching users. The data is
 * disposable: `make start-local` redeploys the contracts and hands out fresh
 * stack ids anyway.
 */

const STORAGE_KEY = "stacks.local-metadata";

type LocalStore = {
  /** Stack metadata by stack id. */
  stacks: Record<string, SupabaseStackMetadata>;
  /** Stack ids each wallet address (lowercased) is a member of. */
  membership: Record<string, string[]>;
};

const emptyStore = (): LocalStore => ({ stacks: {}, membership: {} });

function readStore(): LocalStore {
  if (typeof window === "undefined") return emptyStore();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();

    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return {
      stacks: parsed.stacks ?? {},
      membership: parsed.membership ?? {},
    };
  } catch {
    // Corrupt or hand-edited entry: start over rather than break the page.
    return emptyStore();
  }
}

function writeStore(store: LocalStore): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function addMembership(store: LocalStore, address: string, stackId: string) {
  const key = address.toLowerCase();
  const current = store.membership[key] ?? [];

  if (!current.includes(stackId)) {
    store.membership[key] = [...current, stackId];
  }
}

/** Local-mode equivalent of reading one row from stacks_metadata. */
export function getLocalStackMetadata(
  id: string
): SupabaseStackMetadata | null {
  return readStore().stacks[id] ?? null;
}

/** Local-mode equivalent of joining users -> user_stacks -> stacks_metadata. */
export function getLocalStacksMetadata(
  address: string
): Record<string, SupabaseStackMetadata> {
  const store = readStore();
  const ids = store.membership[address.toLowerCase()] ?? [];

  return Object.fromEntries(
    ids
      .map((id) => store.stacks[id])
      .filter((meta): meta is SupabaseStackMetadata => Boolean(meta))
      .map((meta) => [meta.id, meta])
  );
}

/** Local-mode equivalent of POST /api/stacks/metadata. */
export function createLocalStackMetadata(params: {
  id: string;
  stackname: string;
  expected_members: number;
  invite_links: SupabaseInviteLink[];
  address: Address;
}): void {
  const { id, stackname, expected_members, invite_links, address } = params;
  const store = readStore();

  store.stacks[id] = {
    id,
    stackname,
    expected_members,
    invite_links,
    created_at: new Date().toISOString(),
  };

  addMembership(store, address, id);
  writeStore(store);
}

/**
 * Local-mode equivalent of PATCH /api/stacks/invite. The redeemer's browser
 * only knows about stacks it created, so an invite opened in another browser
 * profile records the membership without a stack row to mark used - the join
 * still works, it just shows up as `Stack <id>` there.
 */
export function redeemLocalInvite(params: {
  circleId: string;
  nonce: string;
  address: Address;
}): void {
  const { circleId, nonce, address } = params;
  const store = readStore();
  const stack = store.stacks[circleId];

  if (stack) {
    stack.invite_links = stack.invite_links.map((link) =>
      link.long.includes(`nonce=${nonce}`) ? { ...link, used: true } : link
    );
  }

  addMembership(store, address, circleId);
  writeStore(store);
}
