// import { clientEnv } from "@/lib/env";
import { isLocalMode } from "@/lib/network-mode";

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

interface ExpandTokenErrorRes {
  success: false;
  error?: string;
}

interface ExpandTokenSuccessRes {
  success: true;
  short_url: string;
  long_url: string;
}

type ExpandTokenResponse = ExpandTokenErrorRes | ExpandTokenSuccessRes;

export async function shortenUrl(
  long_url: string,
  config: Config = {}
): Promise<string> {
  const { check = true, signal } = config;

  // if (clientEnv.NEXT_PUBLIC_NODE_ENV !== "production") {
  //   return long_url;
  // }

  // Local mode: the link points at a throwaway Anvil stack, so there is nothing
  // worth persisting in the shortener - and locally the route just logs
  // "URL shortening failed" on every call. Keep the long URL.
  if (isLocalMode()) return long_url;

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

export async function expandShortUrlToken(
  short_url: string,
  config: { signal?: AbortSignal } = {}
): Promise<string> {
  const { signal } = config;

  // Nothing was shortened in local mode, so there is nothing to expand.
  if (isLocalMode()) return short_url;

  try {
    const response = await fetch("/api/shorten/expand", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ short_url }),
      signal,
    });

    const result = (await response.json()) as ExpandTokenResponse;

    return result.success ? result.long_url : short_url;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    console.error("URL expanding failed:", error);
    return short_url;
  }
}
