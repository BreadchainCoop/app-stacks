import { NextRequest, NextResponse } from "next/server";
import {
  AutopayAuthorizationRecord,
  AutopayAuthorizationScope,
  buildAutopayAuthorizationTypedData,
  getAutopayAuthorizationKey,
  getAutopayFeatureConfig,
} from "@/lib/autopay";
import { readAutopayStore, writeAutopayStore } from "@/lib/autopay-store";
import { getAddress, isAddress, verifyTypedData } from "viem";

export const runtime = "nodejs";

type RequestBody = {
  circleId?: string;
  member?: string;
  scope?: AutopayAuthorizationScope;
  signature?: `0x${string}`;
};

type DeleteRequestBody = {
  circleId?: string;
  member?: string;
  scope?: AutopayAuthorizationScope;
};

export async function POST(request: NextRequest) {
  const { delegatedContract, isConfigured, litNetwork, litPolicyId } =
    getAutopayFeatureConfig();

  if (!isConfigured || !delegatedContract || !litNetwork || !litPolicyId) {
    return NextResponse.json(
      {
        success: false,
        error: "Autopay is not configured for this deployment",
      },
      { status: 403 }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.circleId || !body.member || !body.signature) {
    return NextResponse.json(
      {
        success: false,
        error: "circleId, member, and signature are required",
      },
      { status: 400 }
    );
  }

  if (!isAddress(body.member)) {
    return NextResponse.json(
      { success: false, error: "member must be a valid address" },
      { status: 400 }
    );
  }

  if (body.scope && body.scope !== "circle" && body.scope !== "all_circles") {
    return NextResponse.json(
      { success: false, error: "scope must be circle or all_circles" },
      { status: 400 }
    );
  }

  const member = getAddress(body.member);
  const circleId = BigInt(body.circleId);
  const scope = body.scope ?? "circle";
  const typedData = buildAutopayAuthorizationTypedData({
    circleId,
    member,
    delegatedContract,
    scope,
  });

  const isValid = await verifyTypedData({
    ...typedData,
    address: member,
    signature: body.signature,
  });

  if (!isValid) {
    return NextResponse.json(
      { success: false, error: "Authorization signature is invalid" },
      { status: 400 }
    );
  }

  const record: AutopayAuthorizationRecord = {
    circleId: typedData.message.circleId.toString(),
    member,
    scope,
    chainId: typedData.domain.chainId,
    delegatedContract,
    savingCirclesContract: typedData.domain.verifyingContract,
    litPolicyId,
    litNetwork,
    signature: body.signature,
    createdAt: new Date().toISOString(),
    active: true,
  };

  const store = await readAutopayStore();
  store.authorizations[getAutopayAuthorizationKey(circleId, member, scope)] =
    record;
  await writeAutopayStore(store);

  return NextResponse.json({ success: true, authorization: record });
}

export async function DELETE(request: NextRequest) {
  let body: DeleteRequestBody;
  try {
    body = (await request.json()) as DeleteRequestBody;
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  if (!body.circleId || !body.member) {
    return NextResponse.json(
      {
        success: false,
        error: "circleId and member are required",
      },
      { status: 400 }
    );
  }

  if (!isAddress(body.member)) {
    return NextResponse.json(
      { success: false, error: "member must be a valid address" },
      { status: 400 }
    );
  }

  if (body.scope && body.scope !== "circle" && body.scope !== "all_circles") {
    return NextResponse.json(
      { success: false, error: "scope must be circle or all_circles" },
      { status: 400 }
    );
  }

  const member = getAddress(body.member);
  const circleId = BigInt(body.circleId);
  const scope = body.scope ?? "circle";
  const key = getAutopayAuthorizationKey(circleId, member, scope);
  const store = await readAutopayStore();
  const existing = store.authorizations[key];

  if (!existing) {
    return NextResponse.json(
      { success: false, error: "No autopay authorization found for selection" },
      { status: 404 }
    );
  }

  store.authorizations[key] = {
    ...existing,
    active: false,
  };
  await writeAutopayStore(store);

  return NextResponse.json({
    success: true,
    authorization: store.authorizations[key],
  });
}
