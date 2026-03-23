import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { readAutopayStore } from "@/lib/autopay-store";
import { getAutopayAuthorizationKey } from "@/lib/autopay";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const circleId = request.nextUrl.searchParams.get("circleId");
  const member = request.nextUrl.searchParams.get("member");

  if (!circleId || !member || !isAddress(member)) {
    return NextResponse.json(
      {
        success: false,
        error: "circleId and member are required",
      },
      { status: 400 }
    );
  }

  const store = await readAutopayStore();
  const key = getAutopayAuthorizationKey(BigInt(circleId), getAddress(member));

  return NextResponse.json({
    success: true,
    authorization: store.authorizations[key] ?? null,
    result: store.results[key] ?? null,
  });
}
