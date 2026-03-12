import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/envs/server";
import {
  CachedShortUrl,
  SpooMeListResponse,
  SpooMePayload,
  SpooMeResponse,
  SpooMeUrlItem,
} from "./interface";

const URL_PROTOCOLS = ["http://", "https://"] as const;

const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});
const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days
const EXPANDED_CACHE_TTL = 10 * 24 * 60 * 60; // 10 days

export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url || typeof url !== "string") {
    return { valid: false, error: "long_url is required and must be a string" };
  }

  const hasValidProtocol = URL_PROTOCOLS.some((protocol) =>
    url.startsWith(protocol)
  );

  if (!hasValidProtocol) {
    return {
      valid: false,
      error: "long_url must start with http:// or https://",
    };
  }

  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: "long_url is not a valid URL" };
  }
}

function getCacheKey(long_url: string): string {
  return `shorturl:${long_url}`;
}

function getExpandedCacheKey(short_url: string): string {
  return `expanded_shorturl:${short_url}`;
}

export async function getCachedShortUrl(
  long_url: string
): Promise<CachedShortUrl | null> {
  try {
    const cacheKey = getCacheKey(long_url);
    const cached = await redis.get<CachedShortUrl>(cacheKey);
    return cached;
  } catch (err) {
    console.error("Redis get error:", err);
    return null;
  }
}

export async function setCachedShortUrl(
  long_url: string,
  data: Omit<CachedShortUrl, "cached_at">
): Promise<void> {
  try {
    const cacheKey = getCacheKey(long_url);
    const cachedData: CachedShortUrl = {
      ...data,
      cached_at: new Date().toISOString(),
    };
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(cachedData));
  } catch (err) {
    console.error("Redis set error:", err);
  }
}

export async function getExpandedShortUrlFromCache(
  short_url: string
): Promise<string | null> {
  try {
    const cacheKey = getExpandedCacheKey(short_url);
    const cached = await redis.get<string>(cacheKey);
    return cached ?? null;
  } catch (err) {
    console.error("Redis get expanded error:", err);
    return null;
  }
}

export async function setExpandedShortUrlInCache(
  short_url: string,
  long_url: string
): Promise<void> {
  try {
    const cacheKey = getExpandedCacheKey(short_url);
    await redis.setex(cacheKey, EXPANDED_CACHE_TTL, long_url);
  } catch (err) {
    console.error("Redis set expanded error:", err);
  }
}

export async function checkExistingShortUrl(
  long_url: string
): Promise<SpooMeUrlItem | null> {
  try {
    const filter = {
      status: "ACTIVE",
      search: long_url,
    };

    const filterParam = encodeURIComponent(JSON.stringify(filter));
    const url = `https://spoo.me/api/v1/urls?page=1&pageSize=1&sortBy=created_at&sortOrder=descending&filter=${filterParam}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${serverEnv.SPOO_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to check existing URLs:", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = (await response.json()) as SpooMeListResponse;

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }

    return null;
  } catch (err) {
    console.error("Error checking existing short URL:", err);
    return null;
  }
}

export async function getShortUrlDetailsByAlias(
  alias: string
): Promise<SpooMeUrlItem | null> {
  try {
    const filter = {
      status: "ACTIVE",
      search: alias,
    };

    const filterParam = encodeURIComponent(JSON.stringify(filter));
    const url = `https://spoo.me/api/v1/urls?page=1&pageSize=1&sortBy=created_at&sortOrder=descending&filter=${filterParam}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${serverEnv.SPOO_TOKEN}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      console.error("Failed to get short URL details by alias:", {
        status: response.status,
        statusText: response.statusText,
      });
      return null;
    }

    const data = (await response.json()) as SpooMeListResponse;

    if (data.items && data.items.length > 0) {
      return data.items[0];
    }

    return null;
  } catch (err) {
    console.error("Error getting short URL details by alias:", err);
    return null;
  }
}

export async function expandShortUrlWithCache(
  short_url: string
): Promise<string | null> {
  const cached = await getExpandedShortUrlFromCache(short_url);
  if (cached) {
    return cached;
  }

  try {
    const url = new URL(short_url);
    const alias = url.pathname.replace("/", "");
    if (!alias) {
      return null;
    }

    const item = await getShortUrlDetailsByAlias(alias);
    if (!item || !item.long_url) {
      return null;
    }

    await setExpandedShortUrlInCache(short_url, item.long_url);
    return item.long_url;
  } catch (err) {
    console.error("Error expanding short_url with cache:", err);
    return null;
  }
}

export async function createShortUrl(
  long_url: string
): Promise<SpooMeResponse> {
  const payload: SpooMePayload = {
    long_url,
    block_bots: true,
    private_stats: false,
  };

  const response = await fetch("https://spoo.me/api/v1/shorten", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.SPOO_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorData: unknown = {};
    try {
      errorData = await response.json();
    } catch {}

    console.error("spoo.me API error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorData,
    });

    throw new Error("Failed to create short URL");
  }

  return (await response.json()) as SpooMeResponse;
}
