"use client";

import { createContext, useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { AppSupabaseClient, createSupabaseClient } from "@/lib/supabase";

const SupabaseClientContext = createContext<AppSupabaseClient | null>(null);

export const SupabaseProvider = ({ children }: { children: ReactNode }) => {
  const supabase = useMemo(() => createSupabaseClient(), []);

  return (
    <SupabaseClientContext.Provider value={supabase}>
      {children}
    </SupabaseClientContext.Provider>
  );
};

export const useSupabaseClient = () => {
  const client = useContext(SupabaseClientContext);

  if (!client) {
    throw new Error("useSupabaseClient must be used within SupabaseProvider");
  }

  return client;
};
