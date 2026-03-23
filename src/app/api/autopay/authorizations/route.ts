import { NextRequest, NextResponse } from "next/server";
import {
  AutopayAuthorizationRecord,
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
  signature?: `0x${string}`;
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

  const member = getAddress(body.member);
  const circleId = BigInt(body.circleId);
  const typedData = buildAutopayAuthorizationTypedData({
    circleId,
    member,
    delegatedContract,
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
    circleId: circleId.toString(),
    member,
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
  store.authorizations[getAutopayAuthorizationKey(circleId, member)] = record;
  await writeAutopayStore(store);

  return NextResponse.json({ success: true, authorization: record });
}
