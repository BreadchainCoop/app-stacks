import { NextRequest, NextResponse } from "next/server";
import {
  checkExistingShortUrl,
  createShortUrl,
  getCachedShortUrl,
  setCachedShortUrl,
  validateUrl,
} from "./utils";
import { ShortenRequestBody } from "./interface";
import { createErrorResponse } from "../utils";

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
