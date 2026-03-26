import { NextRequest, NextResponse } from "next/server";
import { runAutopayWorker } from "../../../../../scripts/autopay-runner.mjs";

export const runtime = "nodejs";
export const maxDuration = 60;

function getCronSecretFromRequest(request: NextRequest) {
  return (
    request.headers.get("x-autopay-secret") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    ""
  );
}

export async function POST(request: NextRequest) {
  const configuredSecret = process.env.AUTOPAY_CRON_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      { success: false, error: "AUTOPAY_CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const providedSecret = getCronSecretFromRequest(request);

  if (providedSecret !== configuredSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const result = await runAutopayWorker();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Autopay execution failed.",
      },
      { status: 500 }
    );
  }
}
