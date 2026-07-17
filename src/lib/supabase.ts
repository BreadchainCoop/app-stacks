"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { clientEnv } from "@/lib/env";

export interface SupabaseInviteLink {
  short: string;
  long: string;
  used: boolean;
}

export interface SupabaseStackMetadata {
  id: string;
  stackname: string;
  created_at: string;
  expected_members: number;
  invite_links: SupabaseInviteLink[];
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          privy_user_id: string;
          wallet_address: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          privy_user_id: string;
          wallet_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          privy_user_id?: string;
          wallet_address?: string | null;
          created_at?: string;
        };
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
      };
      stacks_metadata: {
        Row: SupabaseStackMetadata;
        Insert: SupabaseStackMetadata;
        // Update: {
        //   invite_links?: SupabaseInviteLink[];
        // };
        Update: Pick<SupabaseStackMetadata, "invite_links">;
      };
      savings_goals: {
        Row: {
          user_id: string;
          goal: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          goal?: string | null;
          completed?: boolean;
        };
        Update: {
          goal?: string | null;
          completed?: boolean;
        };
      };
    };
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

export const getStacksMetadata = (client: AppSupabaseClient) =>
  client.from("stacks_metadata").select("*").order("created_at", {
    ascending: false,
  });

export const getProfile = (client: AppSupabaseClient, userId: string) =>
  client.from("profiles").select("*").eq("user_id", userId).single();

// export const upsertProfile = (
//   client: AppSupabaseClient,
//   userId: string,
//   username: string | null
// ) =>
//   client
//     .from("profiles")
//     .upsert(
//       { user_id: userId, username },
//       {
//         onConflict: "user_id",
//       }
//     )
//     .select("*")
//     .single();

// export const upsertUser = (
//   client: AppSupabaseClient,
//   id: string,
//   privyUserId: string,
//   walletAddress?: string | null
// ) =>
//   client.from("users").upsert(
//     {
//       id,
//       privy_user_id: privyUserId,
//       wallet_address: walletAddress,
//     },
//     {
//       onConflict: "id",
//     }
//   );
