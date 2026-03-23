import { NextRequest, NextResponse } from "next/server";
import { getAddress, isAddress } from "viem";
import { readAutopayStore } from "@/lib/autopay-store";
import {
  getAutopayAuthorizationKey,
  getAutopayAuthorizationLookupKeys,
} from "@/lib/autopay";

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
  const normalizedMember = getAddress(member);
  const [circleKey, allCirclesKey] = getAutopayAuthorizationLookupKeys(
    BigInt(circleId),
    normalizedMember
  );
  const resultKey = getAutopayAuthorizationKey(
    BigInt(circleId),
    normalizedMember
  );

  return NextResponse.json({
    success: true,
    authorization:
      store.authorizations[circleKey] ??
      store.authorizations[allCirclesKey] ??
      null,
    result: store.results[resultKey] ?? null,
  });
}
