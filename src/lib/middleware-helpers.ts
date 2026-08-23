import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

export async function withRateLimit(
  request: NextRequest,
  type: "auth" | "api" = "api"
): Promise<NextResponse | null> {
  const ip =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const { success } = await checkRateLimit(`${ip}:${type}`, type);

  if (!success) {
    return NextResponse.json(
      { error: { message: "Too many requests", code: 429 } },
      { status: 429 }
    );
  }

  return null;
}
