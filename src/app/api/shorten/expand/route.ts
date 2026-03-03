import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse, expandShortUrlWithCache } from "../utils";

interface ExpandRequestBody {
  short_url: string;
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

    const { short_url } = body as ExpandRequestBody;

    if (!short_url || typeof short_url !== "string") {
      return createErrorResponse("short_url is required and must be a string");
    }

    const url = new URL(short_url);
    if (url.hostname !== "spoo.me") {
      return createErrorResponse("short_url must be a spoo.me URL");
    }

    const long_url = await expandShortUrlWithCache(short_url);
    if (!long_url) {
      return createErrorResponse("Unable to expand short_url", 404);
    }

    return NextResponse.json({
      success: true,
      short_url,
      long_url,
    });
  } catch (err) {
    console.error("Expand shorten endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
