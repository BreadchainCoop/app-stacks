"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { Body } from "@breadcoop/ui";
import type { Address } from "viem";
import Button from "@/components/button";
import Input, { InputDescription } from "@/components/input";
import { useUsername } from "@/hooks/use-usernames";

/**
 * Lets the connected user set a display username (stored in Supabase). Once set,
 * the app shows the name instead of the wallet address in member lists.
 */
export function UsernameSetting({ address }: { address: Address }) {
  const { user } = usePrivy();
  const queryClient = useQueryClient();
  const { username: current } = useUsername(address);

  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "ok" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (current) setValue(current);
  }, [current]);

  const onSave = async () => {
    if (!user?.id) {
      setMessage({ kind: "error", text: "Please sign in first." });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/user/username", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ privyUserId: user.id, username: value.trim() }),
      });
      const json = (await res.json()) as { error?: string; username?: string };
      if (!res.ok) {
        setMessage({ kind: "error", text: json.error ?? "Failed to save." });
        return;
      }
      setMessage({ kind: "ok", text: "Username saved." });
      queryClient.invalidateQueries({ queryKey: ["usernames"] });
    } catch {
      setMessage({ kind: "error", text: "Something went wrong. Try again." });
    } finally {
      setSaving(false);
    }
  };

  const unchanged = value.trim() === (current ?? "");

  return (
    <section className="flex flex-col gap-3">
      <Body bold className="text-lg">
        Display name
      </Body>
      <InputDescription desc="Set a username so others see a name instead of your wallet address." />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="e.g. josh"
          maxLength={20}
          aria-label="Username"
          className="flex-1"
        />
        <Button onClick={onSave} disabled={saving || unchanged || value.trim().length < 3}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      {message && (
        <Body
          className={
            message.kind === "ok" ? "text-system-success" : "text-system-warning"
          }
        >
          {message.text}
        </Body>
      )}
    </section>
  );
}

export default UsernameSetting;
