import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { serverEnv } from "@/lib/envs/server";

interface SpooMePayload {
  long_url: string;
  block_bots: true;
  private_stats: false;
}

interface ShortenRequestBody {
  long_url: string;
  check?: boolean;
}

interface SpooMeResponse {
  short_url: string;
  alias: string;
  long_url: string;
}

interface SpooMeUrlItem {
  alias: string;
  block_bots: boolean;
  created_at: string;
  expire_after: string | null;
  id: string;
  last_click: string | null;
  long_url: string;
  max_clicks: number | null;
  password_set: boolean;
  private_stats: boolean;
  status: string;
  total_clicks: number;
}

interface SpooMeListResponse {
  hasNext: boolean;
  items: SpooMeUrlItem[];
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  total: number;
}

interface CachedShortUrl {
  short_url: string;
  alias: string;
  long_url: string;
  cached_at: string;
}

const URL_PROTOCOLS = ["http://", "https://"] as const;

const redis = new Redis({
  url: serverEnv.UPSTASH_REDIS_REST_URL,
  token: serverEnv.UPSTASH_REDIS_REST_TOKEN,
});

const CACHE_TTL = 30 * 24 * 60 * 60; // 30 days

function validateUrl(url: string): { valid: boolean; error?: string } {
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

function createErrorResponse(error: string, status: number = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

function getCacheKey(long_url: string): string {
  return `shorturl:${long_url}`;
}

async function getCachedShortUrl(
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

async function setCachedShortUrl(
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

async function checkExistingShortUrl(
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

async function createShortUrl(long_url: string): Promise<SpooMeResponse> {
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

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body");
    }

    if (!body || typeof body !== "object") {
      return createErrorResponse("Invalid request body");
    }

    const { long_url, check = true } = body as ShortenRequestBody;

    const urlValidation = validateUrl(long_url);
    if (!urlValidation.valid) {
      return createErrorResponse(urlValidation.error!);
    }

    if (!check) {
      const data = await createShortUrl(long_url);

      void setCachedShortUrl(long_url, {
        short_url: data.short_url,
        alias: data.alias,
        long_url: data.long_url,
      });

      return NextResponse.json({
        success: true,
        short_url: data.short_url,
        alias: data.alias,
        long_url: data.long_url,
        existing: false,
        cache_hit: false,
      });
    }

    const cachedUrl = await getCachedShortUrl(long_url);
    if (cachedUrl) {
      return NextResponse.json({
        success: true,
        short_url: cachedUrl.short_url,
        alias: cachedUrl.alias,
        long_url: cachedUrl.long_url,
        existing: true,
        cache_hit: true,
      });
    }

    const existingUrl = await checkExistingShortUrl(long_url);
    if (existingUrl) {
      const shortUrl = `https://spoo.me/${existingUrl.alias}`;

      void setCachedShortUrl(long_url, {
        short_url: shortUrl,
        alias: existingUrl.alias,
        long_url: existingUrl.long_url,
      });

      return NextResponse.json({
        success: true,
        short_url: shortUrl,
        alias: existingUrl.alias,
        long_url: existingUrl.long_url,
        existing: true,
        cache_hit: false,
      });
    }

    const data = await createShortUrl(long_url);

    await setCachedShortUrl(long_url, {
      short_url: data.short_url,
      alias: data.alias,
      long_url: data.long_url,
    });

    return NextResponse.json({
      success: true,
      short_url: data.short_url,
      alias: data.alias,
      long_url: data.long_url,
      existing: false,
      cache_hit: false,
    });
  } catch (err) {
    console.error("Shorten endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
