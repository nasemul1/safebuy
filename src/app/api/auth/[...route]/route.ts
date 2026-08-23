import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, refreshTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema, loginSchema } from "@/lib/validations";
import {
  hashPassword,
  comparePassword,
  generateTokens,
  setTokenCookies,
  clearTokenCookies,
  getCurrentUser,
  refreshAccessToken,
} from "@/lib/auth";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";

async function register(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0].message, code: 400 } },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Check if email exists
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: { message: "Email already registered", code: 409 } },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = crypto.randomUUID();

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        verificationToken,
      })
      .returning({ id: users.id, email: users.email, role: users.role });

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { data: { message: "Verification email sent" } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

async function login(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { message: parsed.error.issues[0].message, code: 400 } },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: { message: "Invalid credentials", code: 401 } },
        { status: 401 }
      );
    }

    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: { message: "Invalid credentials", code: 401 } },
        { status: 401 }
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { error: { message: "Please verify your email", code: 403 } },
        { status: 403 }
      );
    }

    const { accessToken, refreshToken } = await generateTokens({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    await setTokenCookies(accessToken, refreshToken);

    return NextResponse.json({
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          reputationScore: user.reputationScore,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

async function logout() {
  await clearTokenCookies();
  return NextResponse.json({ data: { message: "Logged out" } });
}

async function me() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: { message: "Not authenticated", code: 401 } },
      { status: 401 }
    );
  }

  const [fullUser] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      reputationScore: users.reputationScore,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!fullUser) {
    return NextResponse.json(
      { error: { message: "User not found", code: 404 } },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: fullUser });
}

async function refresh(request: NextRequest) {
  try {
    const body = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return NextResponse.json(
        { error: { message: "Refresh token required", code: 400 } },
        { status: 400 }
      );
    }

    const newAccessToken = await refreshAccessToken(refreshToken);
    if (!newAccessToken) {
      return NextResponse.json(
        { error: { message: "Invalid refresh token", code: 401 } },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return NextResponse.json({ data: { message: "Token refreshed" } });
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { error: { message: "Internal server error", code: 500 } },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const action = route[0];

  switch (action) {
    case "register":
      return register(request);
    case "login":
      return login(request);
    case "logout":
      return logout();
    case "refresh":
      return refresh(request);
    default:
      return NextResponse.json(
        { error: { message: "Not found", code: 404 } },
        { status: 404 }
      );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string[] }> }
) {
  const { route } = await params;
  const action = route[0];

  switch (action) {
    case "me":
      return me();
    default:
      return NextResponse.json(
        { error: { message: "Not found", code: 404 } },
        { status: 404 }
      );
  }
}
