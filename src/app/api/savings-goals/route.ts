import { serverEnv } from "@/lib/envs/server";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createErrorResponse } from "../utils";

const supabaseAdmin = createClient(
  serverEnv.NEXT_PUBLIC_SUPABASE_URL,
  serverEnv.SUPABASE_SERVICE_ROLE_KEY
);

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
    .select("goal, completed")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    goal: goals?.goal ?? null,
    completed: goals?.completed ?? false,
  });
}

interface SavingsGoalsBody {
  privyUserId: string;
  goal: string | null;
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

    const { privyUserId, goal } = body as SavingsGoalsBody;

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
          goal: goal ?? null,
          completed: !!goal,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Failed to save savings goal:", upsertError);
      return createErrorResponse("Failed to save savings goal", 500);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Savings goals endpoint error:", err);
    return createErrorResponse("Internal server error", 500);
  }
}
