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

type Config = {
  check?: boolean;
  signal?: AbortSignal;
};

export async function shortenUrl(
  long_url: string,
  config: Config = {}
): Promise<string> {
  const { check = true, signal } = config;

  if (clientEnv.NEXT_PUBLIC_NODE_ENV !== "production") {
    return long_url;
  }

  try {
    const response = await fetch("/api/shorten", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ long_url, check }),
      signal,
    });

    const result = (await response.json()) as ShortenUrlResponse;

    return result.success ? result.short_url : long_url;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    console.error("URL shortening failed:", error);
    return long_url;
  }
}
