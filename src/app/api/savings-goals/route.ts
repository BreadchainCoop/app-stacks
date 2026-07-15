import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../utils";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

interface SavingsGoalsBody {
  privyUserId: string;
  responses: {
    goals: string[];
    amount: string | null;
    timeline: string | null;
    monthly: string | null;
  };
  partial: boolean;
}

export async function GET(req: NextRequest) {
  const privyUserId = req.nextUrl.searchParams.get("privyUserId");

  if (!privyUserId) {
    return createErrorResponse("privyUserId is required");
  }

  const { data: user, error: userError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("privy_user_id", privyUserId)
    .single();

  if (userError || !user) {
    return createErrorResponse("User not found", 404);
  }

  const { data: goals } = await supabaseAdmin
    .from("savings_goals")
    .select("completed")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({ completed: goals?.completed ?? false });
}

export async function POST(req: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return createErrorResponse("Invalid JSON in request body");
    }

    if (!body || typeof body !== "object") {
      return createErrorResponse("Invalid request body");
    }

    const { privyUserId, responses, partial } = body as SavingsGoalsBody;

    if (!privyUserId || typeof privyUserId !== "string") {
      return createErrorResponse(
        "privyUserId is required and must be a string"
      );
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("privy_user_id", privyUserId)
      .single();

    if (userError || !user) {
      return createErrorResponse("User not found", 404);
    }

    const { error: upsertError } = await supabaseAdmin
      .from("savings_goals")
      .upsert(
        {
          user_id: user.id,
          goals: responses.goals,
          target_amount: responses.amount,
          timeline: responses.timeline,
          monthly_savings: responses.monthly,
          completed: !partial,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save savings goals:", upsertError);
      return createErrorResponse("Failed to save savings goals", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Savings goals endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
