import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, evidence, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateReportSchema } from "@/lib/validations";
import { getUserIdFromRequest } from "@/lib/auth";
import { withRateLimit } from "@/lib/middleware-helpers";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = await withRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { id } = await params;

    const [report] = await db
      .select({
        id: reports.id,
        title: reports.title,
        description: reports.description,
        platform: reports.platform,
        sellerName: reports.sellerName,
        sellerUrl: reports.sellerUrl,
        status: reports.status,
        createdAt: reports.createdAt,
        updatedAt: reports.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          reputationScore: users.reputationScore,
        },
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: { message: "Report not found", code: 404 } },
        { status: 404 }
      );
    }

    const reportEvidence = await db
      .select()
      .from(evidence)
      .where(eq(evidence.reportId, id));

    return NextResponse.json({
      data: { ...report, evidence: reportEvidence },
    });
  } catch (error) {
    console.error("Get report error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    const parsed = updateReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0].message, code: 400 } },
        { status: 400 }
      );
    }

    const [existing] = await db
      .select({ userId: reports.userId })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { message: "Report not found", code: 404 } },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: { message: "Not authorized", code: 403 } },
        { status: 403 }
      );
    }

    const [updated] = await db
      .update(reports)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(reports.id, id))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Update report error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const [existing] = await db
      .select({ userId: reports.userId })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: { message: "Report not found", code: 404 } },
        { status: 404 }
      );
    }

    if (existing.userId !== userId) {
      return NextResponse.json(
        { error: { message: "Not authorized", code: 403 } },
        { status: 403 }
      );
    }

    await db.delete(reports).where(eq(reports.id, id));

    return NextResponse.json({ data: { message: "Report deleted" } });
  } catch (error) {
    console.error("Delete report error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}
