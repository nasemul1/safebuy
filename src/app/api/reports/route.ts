import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { eq, desc, and, sql, count } from "drizzle-orm";
import { createReportSchema, searchSchema } from "@/lib/validations";
import { getUserIdFromRequest } from "@/lib/auth";
import { withRateLimit } from "@/lib/middleware-helpers";

export async function GET(request: NextRequest) {
  const rateLimitResponse = await withRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    const parsed = searchSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: "Invalid parameters", code: 400 } },
        { status: 400 }
      );
    }

    const { search, platform, status, page, limit } = parsed.data;
    const offset = (page - 1) * limit;

    const conditions = [];
    if (search) {
      conditions.push(
        sql`(${reports.title} ILIKE ${`%${search}%`} OR ${reports.sellerName} ILIKE ${`%${search}%`})`
      );
    }
    if (platform) {
      conditions.push(eq(reports.platform, platform));
    }
    if (status) {
      conditions.push(eq(reports.status, status));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(whereClause);

    const reportList = await db
      .select({
        id: reports.id,
        title: reports.title,
        description: reports.description,
        platform: reports.platform,
        sellerName: reports.sellerName,
        sellerUrl: reports.sellerUrl,
        status: reports.status,
        createdAt: reports.createdAt,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(reports)
      .leftJoin(users, eq(reports.userId, users.id))
      .where(whereClause)
      .orderBy(desc(reports.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: reportList,
      pagination: {
        page,
        limit,
        total: totalResult.count,
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const body = await request.json();
    const parsed = createReportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0].message, code: 400 } },
        { status: 400 }
      );
    }

    const [newReport] = await db
      .insert(reports)
      .values({
        ...parsed.data,
        sellerUrl: parsed.data.sellerUrl || null,
        userId,
      })
      .returning();

    return NextResponse.json({ data: newReport }, { status: 201 });
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}
