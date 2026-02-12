import { NextRequest, NextResponse } from "next/server";
import { serverEnv } from "@/lib/envs/server";

interface SpooMePayload {
  long_url: string;
  block_bots: true;
  private_stats: false;
}

interface ShortenRequestBody {
  long_url: string;
}

interface SpooMeResponse {
  short_url: string;
  alias: string;
  long_url: string;
}

const URL_PROTOCOLS = ["http://", "https://"] as const;

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

    const { long_url } = body as ShortenRequestBody;

    const urlValidation = validateUrl(long_url);
    if (!urlValidation.valid) {
      return createErrorResponse(urlValidation.error!);
    }

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

      return createErrorResponse("Failed to create short URL", 500);
    }

    const data = (await response.json()) as SpooMeResponse;

    return NextResponse.json({
      success: true,
      short_url: data.short_url,
      alias: data.alias,
      long_url: data.long_url,
    });
  } catch (err) {
    console.error("Shorten endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
