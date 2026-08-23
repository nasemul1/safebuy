import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evidence, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";
import { evidenceTypeEnum } from "@/lib/validations";
import { withRateLimit } from "@/lib/middleware-helpers";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await withRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json(
      { error: { message: "Not authenticated", code: 401 } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    const [report] = await db
      .select({ userId: reports.userId })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: { message: "Report not found", code: 404 } },
        { status: 404 }
      );
    }

    if (report.userId !== userId) {
      return NextResponse.json(
        { error: { message: "Not authorized", code: 403 } },
        { status: 403 }
      );
    }

    const parsed = evidenceTypeEnum.safeParse(body.type);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid evidence type", code: 400 } },
        { status: 400 }
      );
    }

    if (!body.url) {
      return NextResponse.json(
        { error: { message: "URL required", code: 400 } },
        { status: 400 }
      );
    }

    const [newEvidence] = await db
      .insert(evidence)
      .values({
        reportId: id,
        url: body.url,
        type: parsed.data,
      })
      .returning();

    return NextResponse.json({ data: newEvidence }, { status: 201 });
  } catch (error) {
    console.error("Add evidence error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}
