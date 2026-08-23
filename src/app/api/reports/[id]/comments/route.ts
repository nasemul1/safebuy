import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { comments, users, reports } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { createCommentSchema, paginationSchema } from "@/lib/validations";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const paginationParsed = paginationSchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    const { page, limit } = paginationParsed.success
      ? paginationParsed.data
      : { page: 1, limit: 10 };
    const offset = (page - 1) * limit;

    // Check report exists
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: { message: "Report not found", code: 404 } },
        { status: 404 }
      );
    }

    const [totalResult] = await db
      .select({ count: count() })
      .from(comments)
      .where(eq(comments.reportId, id));

    const commentList = await db
      .select({
        id: comments.id,
        content: comments.content,
        createdAt: comments.createdAt,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.reportId, id))
      .orderBy(desc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data: commentList,
      pagination: {
        page,
        limit,
        total: totalResult.count,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const parsed = createCommentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0].message, code: 400 } },
        { status: 400 }
      );
    }

    // Check report exists
    const [report] = await db
      .select({ id: reports.id })
      .from(reports)
      .where(eq(reports.id, id))
      .limit(1);

    if (!report) {
      return NextResponse.json(
        { error: { message: "Report not found", code: 404 } },
        { status: 404 }
      );
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        reportId: id,
        userId,
        content: parsed.data.content,
      })
      .returning();

    return NextResponse.json({ data: newComment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}
