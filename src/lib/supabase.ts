"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";
import { StackType } from "@/lib/stack-types";

// Must stay type aliases: interfaces break supabase-js's generics and every
// query silently degrades to never.
export type SupabaseStackMetadata = {
  // Circle ids come from a per-chain counter, so the chain is part of the key:
  // circle 5 exists on every chain and they are unrelated stacks.
  chain_id: number;
  id: string;
  stackname: string;
  stack_type: StackType;
  created_at: string;
  expected_members: number;
};

export type SupabaseJoinRequestStatus = "pending" | "added" | "dismissed";

export type SupabaseJoinRequest = {
  id: string;
  chain_id: number;
  stack_id: string;
  user_id: string;
  wallet_address: string;
  status: SupabaseJoinRequestStatus;
  created_at: string;
};

// Mirror the supabase generated-types shape (Relationships per table,
// Views/Functions/Enums/CompositeTypes on the schema) or queries degrade.
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          privy_user_id: string;
          wallet_address: string | null;
          created_at: string;
          transferred_to_wallet_at: string | null;
        };
        Insert: {
          id: string;
          privy_user_id: string;
          wallet_address?: string | null;
          created_at?: string;
          transferred_to_wallet_at?: string | null;
        };
        Update: {
          id?: string;
          privy_user_id?: string;
          wallet_address?: string | null;
          created_at?: string;
          transferred_to_wallet_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          user_id: string;
          username: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          username?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          username?: string | null;
          updated_at?: string;
        };
        // Declared so `users` can embed `profiles` in one query; user_id is
        // the primary key, so PostgREST treats the embed as to-one.
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      stacks_metadata: {
        Row: SupabaseStackMetadata;
        // created_at is defaulted by Postgres and never sent by the app.
        Insert: Omit<SupabaseStackMetadata, "created_at"> & {
          created_at?: string;
        };
        Update: Partial<SupabaseStackMetadata>;
        Relationships: [];
      };
      user_stacks: {
        Row: {
          user_id: string;
          chain_id: number;
          stack_id: string;
        };
        Insert: {
          user_id: string;
          chain_id: number;
          stack_id: string;
        };
        Update: {
          user_id?: string;
          chain_id?: number;
          stack_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_stacks_stack_fkey";
            columns: ["chain_id", "stack_id"];
            isOneToOne: false;
            referencedRelation: "stacks_metadata";
            referencedColumns: ["chain_id", "id"];
          },
        ];
      };
      join_requests: {
        Row: SupabaseJoinRequest;
        Insert: Omit<SupabaseJoinRequest, "id" | "created_at" | "status"> & {
          status?: SupabaseJoinRequestStatus;
        };
        Update: Pick<SupabaseJoinRequest, "status">;
        Relationships: [
          {
            foreignKeyName: "join_requests_stack_fkey";
            columns: ["chain_id", "stack_id"];
            isOneToOne: false;
            referencedRelation: "stacks_metadata";
            referencedColumns: ["chain_id", "id"];
          },
          {
            foreignKeyName: "join_requests_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export type AppSupabaseClient = SupabaseClient<Database>;

export const createSupabaseClient = () =>
  createClient<Database>(
    clientEnv.NEXT_PUBLIC_SUPABASE_URL,
    clientEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );

export const signInWithPrivyToken = (
  client: AppSupabaseClient,
  accessToken: string
) =>
  client.auth.signInWithIdToken({
    provider: "privy" as string,
    token: accessToken,
  });

export const getCurrentSession = async (client: AppSupabaseClient) => {
  const { data, error } = await client.auth.getSession();
  return { session: data.session, error };
};

export const getStacksMetadata = (client: AppSupabaseClient, chainId: number) =>
  client
    .from("stacks_metadata")
    .select("*")
    .eq("chain_id", chainId)
    .order("created_at", {
      ascending: false,
    });

export interface MemberAlias {
  walletAddress: string;
  username: string | null;
}

export const getMemberAliases = async (
  client: AppSupabaseClient,
  walletAddresses: readonly string[]
): Promise<MemberAlias[]> => {
  if (walletAddresses.length === 0) return [];

  // .in() is case-sensitive; match both casings
  const candidates = [
    ...walletAddresses,
    ...walletAddresses.map((a) => a.toLowerCase()),
  ];

  // profiles is embedded over the profiles.user_id -> users.id foreign key, so
  // a batch of addresses resolves in a single round-trip.
  const { data: users, error } = await client
    .from("users")
    .select("wallet_address, profiles(username)")
    .in("wallet_address", candidates);

  if (error) throw error;

  return (users ?? [])
    .filter((u): u is typeof u & { wallet_address: string } =>
      Boolean(u.wallet_address)
    )
    .map((u) => ({
      walletAddress: u.wallet_address,
      username: u.profiles?.username ?? null,
    }));
};
