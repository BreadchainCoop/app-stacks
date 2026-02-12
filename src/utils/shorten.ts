import { clientEnv } from "@/lib/env";

interface ShortenUrlErrorRes {
  success: false;
  error?: string;
}

interface ShortenUrlSuccessResp {
  success: true;
  short_url: string;
  alias: string;
  long_url: string;
  error?: never;
}

type ShortenUrlResponse = ShortenUrlErrorRes | ShortenUrlSuccessResp;

export async function shortenUrl(long_url: string): Promise<string> {
  if (clientEnv.NEXT_PUBLIC_NODE_ENV !== "production") {
    return long_url;
  }

  const response = await fetch("/api/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ long_url }),
  });

  const result = (await response.json()) as ShortenUrlResponse;

  return result.success ? result.short_url : long_url;
}
