# SafeBuy Forum MVP — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build core SafeBuy Forum — auth system, fraud reports CRUD, evidence upload, and comments.

**Architecture:** Next.js 15 App Router with Route Handlers for API, Server Components for pages, Client Components for interactive parts. Drizzle ORM + NeonDB for data, Cloudinary for file storage, JWT in HttpOnly cookies for auth.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Drizzle ORM, NeonDB, Cloudinary, Nodemailer, goey-toast, bcrypt, jsonwebtoken, Zod

## Global Constraints

- Node.js >= 18
- Next.js 15 (App Router)
- TypeScript strict mode
- Drizzle ORM with NeonDB (serverless Postgres)
- JWT access token: 15min expiry, refresh token: 7 days
- Password hashing: bcrypt, 12 rounds
- File upload: Cloudinary, max 5MB per file
- Email: Nodemailer with 24hr verification token expiry
- Toast notifications: goey-toast
- Rate limiting: Upstash Redis (5 req/s auth, 10 req/s API)
- Validation: Zod on all inputs (client + server)
- UUID primary keys on all tables
- Minimalist clean UI: Inter/Geist font, slate palette, blue accent

---

## File Structure

```
safebuy/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (public)/
│   │   │   ├── reports/page.tsx
│   │   │   └── reports/[id]/page.tsx
│   │   ├── (protected)/
│   │   │   ├── profile/page.tsx
│   │   │   └── create-report/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...route]/route.ts
│   │   │   ├── reports/route.ts
│   │   │   ├── reports/[id]/route.ts
│   │   │   ├── reports/[id]/comments/route.ts
│   │   │   └── upload/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   └── toaster.tsx
│   │   ├── layout/
│   │   │   ├── navbar.tsx
│   │   │   └── footer.tsx
│   │   ├── reports/
│   │   │   ├── report-card.tsx
│   │   │   ├── report-form.tsx
│   │   │   └── evidence-gallery.tsx
│   │   └── comments/
│   │       ├── comment-section.tsx
│   │       └── comment-form.tsx
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts
│   │   │   ├── schema.ts
│   │   │   └── migrations/
│   │   ├── auth.ts
│   │   ├── cloudinary.ts
│   │   ├── email.ts
│   │   ├── rate-limit.ts
│   │   └── validations.ts
│   ├── middleware.ts
│   └── types/
│       └── index.ts
├── drizzle.config.ts
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── .env.example
└── seed.ts
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `.env.example`, `drizzle.config.ts`

**Interfaces:**
- Produces: Project skeleton ready for development

- [ ] **Step 1: Initialize Next.js project**

```bash
npx create-next-app@latest safebuy --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Select: TypeScript, Tailwind CSS, ESLint, App Router, src directory, `@/*` import alias.

- [ ] **Step 2: Install core dependencies**

```bash
npm install drizzle-orm @neondatabase/serverless bcryptjs jsonwebtoken zod cloudinary nodemailer upstash/ratelimit @upstash/redis goey-toast framer-motion
npm install -D drizzle-kit @types/bcryptjs @types/jsonwebtoken @types/nodemailer
```

- [ ] **Step 3: Create `.env.example`**

```env
# Database
DATABASE_URL=

# JWT
JWT_SECRET=
REFRESH_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Nodemailer)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=

# Upstash Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 4: Create `drizzle.config.ts`**

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

- [ ] **Step 5: Add scripts to `package.json`**

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx seed.ts"
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: initialize project with Next.js 15, Drizzle, Tailwind"
```

---

## Task 2: Database Schema

**Files:**
- Create: `src/lib/db/schema.ts`, `src/lib/db/index.ts`

**Interfaces:**
- Produces: All table definitions, Drizzle client instance

- [ ] **Step 1: Create `src/lib/db/schema.ts`**

```typescript
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const userRoleEnum = pgEnum("user_role", ["USER", "MODERATOR", "ADMIN"]);
export const platformEnum = pgEnum("platform", [
  "Facebook",
  "Instagram",
  "Daraz",
  "Website",
  "WhatsApp",
  "Other",
]);
export const reportStatusEnum = pgEnum("report_status", [
  "PENDING",
  "UNDER_REVIEW",
  "VERIFIED",
  "REJECTED",
]);
export const evidenceTypeEnum = pgEnum("evidence_type", [
  "SCREENSHOT",
  "INVOICE",
  "RECEIPT",
  "CHAT_PROOF",
  "OTHER",
]);
export const voteTypeEnum = pgEnum("vote_type", ["CONFIRM", "DISAGREE"]);

// Users
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRoleEnum("role").default("USER").notNull(),
  reputationScore: integer("reputation_score").default(0).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  verificationToken: varchar("verification_token", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Refresh Tokens
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  token: varchar("token", { length: 500 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Reports
export const reports = pgTable("reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  platform: platformEnum("platform").notNull(),
  sellerName: varchar("seller_name", { length: 255 }).notNull(),
  sellerUrl: varchar("seller_url", { length: 500 }),
  status: reportStatusEnum("status").default("PENDING").notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Evidence
export const evidence = pgTable("evidence", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  url: varchar("url", { length: 500 }).notNull(),
  type: evidenceTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Comments
export const comments = pgTable("comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Votes
export const votes = pgTable(
  "votes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reportId: uuid("report_id")
      .references(() => reports.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    voteType: voteTypeEnum("vote_type").notNull(),
  },
  (table) => [uniqueIndex("votes_report_user_idx").on(table.reportId, table.userId)]
);

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  reportId: uuid("report_id")
    .references(() => reports.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  oldStatus: varchar("old_status", { length: 50 }),
  newStatus: varchar("new_status", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

- [ ] **Step 2: Create `src/lib/db/index.ts`**

```typescript
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);

export const db = drizzle(sql, { schema });
```

- [ ] **Step 3: Run migration**

```bash
npm run db:generate
npm run db:push
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/
git commit -m "feat: add database schema with Drizzle ORM"
```

---

## Task 3: Validation Schemas

**Files:**
- Create: `src/lib/validations.ts`

**Interfaces:**
- Produces: Zod schemas for register, login, report create/update, comment create, vote

- [ ] **Step 1: Create `src/lib/validations.ts`**

```typescript
import { z } from "zod";

// Auth
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// Reports
export const createReportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  platform: z.enum(["Facebook", "Instagram", "Daraz", "Website", "WhatsApp", "Other"]),
  sellerName: z.string().min(2, "Seller name is required"),
  sellerUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export const updateReportSchema = z.object({
  title: z.string().min(5).optional(),
  description: z.string().min(20).optional(),
  platform: z.enum(["Facebook", "Instagram", "Daraz", "Website", "WhatsApp", "Other"]).optional(),
  sellerName: z.string().min(2).optional(),
  sellerUrl: z.string().url().optional().or(z.literal("")),
});

// Comments
export const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

// Evidence
export const evidenceTypeEnum = z.enum(["SCREENSHOT", "INVOICE", "RECEIPT", "CHAT_PROOF", "OTHER"]);

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

// Search
export const searchSchema = z.object({
  search: z.string().optional(),
  platform: z.enum(["Facebook", "Instagram", "Daraz", "Website", "WhatsApp", "Other"]).optional(),
  status: z.enum(["PENDING", "UNDER_REVIEW", "VERIFIED", "REJECTED"]).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/validations.ts
git commit -m "feat: add Zod validation schemas"
```

---

## Task 4: Auth Utilities

**Files:**
- Create: `src/lib/auth.ts`, `src/types/index.ts`

**Interfaces:**
- Produces: `generateTokens()`, `verifyAccessToken()`, `verifyRefreshToken()`, `hashPassword()`, `comparePassword()`, `getUserIdFromRequest()`, `getCurrentUser()`

- [ ] **Step 1: Create `src/types/index.ts`**

```typescript
export interface UserPayload {
  id: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    message: string;
    code: number;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

- [ ] **Step 2: Create `src/lib/auth.ts`**

```typescript
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { db } from "./db";
import { users, refreshTokens } from "./db/schema";
import { eq, and, gt } from "drizzle-orm";
import type { UserPayload, TokenPair } from "@/types";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(payload: UserPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function generateRefreshToken(payload: UserPayload): string {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): UserPayload | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

export async function generateTokens(user: {
  id: string;
  email: string;
  role: "USER" | "MODERATOR" | "ADMIN";
}): Promise<TokenPair> {
  const payload: UserPayload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in DB
  await db.insert(refreshTokens).values({
    userId: user.id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
  });

  return { accessToken, refreshToken };
}

export async function setTokenCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set("access_token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60, // 15 minutes
    path: "/",
  });

  cookieStore.set("refresh_token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearTokenCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
}

export async function getUserIdFromRequest(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  const payload = verifyAccessToken(token);
  return payload?.id ?? null;
}

export async function getCurrentUser(): Promise<UserPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;

  return verifyAccessToken(token);
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<string | null> {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return null;

  // Check if refresh token exists in DB and is not expired
  const [storedToken] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token, refreshToken),
        gt(refreshTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!storedToken) return null;

  // Generate new access token
  return generateAccessToken({
    id: payload.id,
    email: payload.email,
    role: payload.role,
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/auth.ts src/types/index.ts
git commit -m "feat: add JWT auth utilities with access/refresh tokens"
```

---

## Task 5: Auth API Routes

**Files:**
- Create: `src/app/api/auth/[...route]/route.ts`

**Interfaces:**
- Consumes: `registerSchema`, `loginSchema` from validations
- Consumes: `hashPassword`, `comparePassword`, `generateTokens`, `setTokenCookies`, `clearTokenCookies`, `getCurrentUser`, `verifyRefreshToken`, `refreshAccessToken` from auth
- Produces: POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me, POST /api/auth/refresh

- [ ] **Step 1: Create `src/app/api/auth/[...route]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
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
        { error: { message: parsed.error.errors[0].message, code: 400 } },
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
        { error: { message: parsed.error.errors[0].message, code: 400 } },
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/auth/
git commit -m "feat: add auth API routes (register, login, logout, me, refresh)"
```

---

## Task 6: Email Service

**Files:**
- Create: `src/lib/email.ts`

**Interfaces:**
- Consumes: SMTP environment variables
- Produces: `sendVerificationEmail(email, token)`

- [ ] **Step 1: Create `src/lib/email.ts`**

```typescript
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string
): Promise<void> {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your SafeBuy account",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to SafeBuy!</h2>
        <p>Click the button below to verify your email address:</p>
        <a href="${verifyUrl}" style="
          display: inline-block;
          background-color: #3b82f6;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 6px;
          margin: 16px 0;
        ">Verify Email</a>
        <p style="color: #666; font-size: 14px;">
          If you didn't create an account, you can safely ignore this email.
        </p>
        <p style="color: #666; font-size: 14px;">
          This link expires in 24 hours.
        </p>
      </div>
    `,
  });
}
```

- [ ] **Step 2: Add verify route to auth handler**

Update `src/app/api/auth/[...route]/route.ts` — add this function and register it in the GET switch:

```typescript
async function verify(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: { message: "Token required", code: 400 } },
        { status: 400 }
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: { message: "Invalid token", code: 400 } },
        { status: 400 }
      );
    }

    await db
      .update(users)
      .set({ emailVerified: true, verificationToken: null })
      .where(eq(users.id, user.id));

    return NextResponse.redirect(
      new URL("/login?verified=true", request.url)
    );
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.redirect(
      new URL("/login?error=verification_failed", request.url)
    );
  }
}
```

Add `"verify"` case to the GET switch.

- [ ] **Step 3: Commit**

```bash
git add src/lib/email.ts src/app/api/auth/
git commit -m "feat: add Nodemailer email verification"
```

---

## Task 7: Cloudinary Upload

**Files:**
- Create: `src/lib/cloudinary.ts`, `src/app/api/upload/route.ts`

**Interfaces:**
- Consumes: Cloudinary environment variables
- Produces: POST /api/upload → returns `{ url, type }`

- [ ] **Step 1: Create `src/lib/cloudinary.ts`**

```typescript
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(
  file: Buffer,
  folder: string = "safebuy"
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Upload failed"));
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    uploadStream.end(file);
  });
}

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
];
```

- [ ] **Step 2: Create `src/app/api/upload/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary, MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from "@/lib/cloudinary";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json(
      { error: { message: "Not authenticated", code: 401 } },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string;

    if (!file) {
      return NextResponse.json(
        { error: { message: "No file provided", code: 400 } },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: { message: "File too large (max 5MB)", code: 400 } },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: { message: "Invalid file type", code: 400 } },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { url } = await uploadToCloudinary(buffer);

    return NextResponse.json({
      data: { url, type: type || "OTHER" },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: { message: "Upload failed", code: 500 } },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/cloudinary.ts src/app/api/upload/
git commit -m "feat: add Cloudinary upload endpoint with validation"
```

---

## Task 8: Rate Limiting

**Files:**
- Create: `src/lib/rate-limit.ts`

**Interfaces:**
- Consumes: Upstash Redis environment variables
- Produces: `checkRateLimit(identifier, config)` → `{ success: boolean, remaining: number }`

- [ ] **Step 1: Create `src/lib/rate-limit.ts`**

```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const authLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 s"), // 5 requests per 10 seconds
  analytics: true,
});

const apiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests per 10 seconds
  analytics: true,
});

export async function checkRateLimit(
  identifier: string,
  type: "auth" | "api" = "api"
): Promise<{ success: boolean; remaining: number }> {
  const limiter = type === "auth" ? authLimiter : apiLimiter;
  const { success, remaining } = await limiter.limit(identifier);
  return { success, remaining };
}
```

- [ ] **Step 2: Add rate limiting middleware helper**

Create `src/lib/middleware-helpers.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

export async function withRateLimit(
  request: NextRequest,
  type: "auth" | "api" = "api"
): Promise<NextResponse | null> {
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  const { success } = await checkRateLimit(`${ip}:${type}`, type);

  if (!success) {
    return NextResponse.json(
      { error: { message: "Too many requests", code: 429 } },
      { status: 429 }
    );
  }

  return null; // No rate limit hit
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/rate-limit.ts src/lib/middleware-helpers.ts
git commit -m "feat: add Upstash Redis rate limiting"
```

---

## Task 9: Auth Middleware

**Files:**
- Create/Modify: `src/middleware.ts`

**Interfaces:**
- Consumes: `verifyAccessToken` from auth
- Produces: Route protection for /admin/*, /create-report, /profile

- [ ] **Step 1: Create `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";

const protectedRoutes = ["/create-report", "/profile"];
const adminRoutes = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check admin routes
  if (adminRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = verifyAccessToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Check protected routes
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = verifyAccessToken(token);
    if (!payload) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/create-report", "/profile", "/admin/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add auth middleware for route protection"
```

---

## Task 10: Reports API

**Files:**
- Create: `src/app/api/reports/route.ts`, `src/app/api/reports/[id]/route.ts`

**Interfaces:**
- Consumes: `createReportSchema`, `updateReportSchema`, `searchSchema` from validations
- Consumes: `getUserIdFromRequest`, `getCurrentUser` from auth
- Consumes: `withRateLimit` from middleware-helpers
- Produces: GET /api/reports, POST /api/reports, GET /api/reports/[id], PATCH /api/reports/[id], DELETE /api/reports/[id]

- [ ] **Step 1: Create `src/app/api/reports/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import { eq, desc, like, and, sql, count } from "drizzle-orm";
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

    // Build conditions
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

    // Get total count
    const [totalResult] = await db
      .select({ count: count() })
      .from(reports)
      .where(whereClause);

    // Get reports with user info
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
        { error: { message: parsed.error.errors[0].message, code: 400 } },
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
```

- [ ] **Step 2: Create `src/app/api/reports/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reports, evidence, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { updateReportSchema } from "@/lib/validations";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    // Get evidence
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
        { error: { message: parsed.error.errors[0].message, code: 400 } },
        { status: 400 }
      );
    }

    // Check ownership
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
  const userId = await getUserIdFromRequest();
  if (!userId) {
    return NextResponse.json(
      { error: { message: "Not authenticated", code: 401 } },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // Check ownership
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/reports/
git commit -m "feat: add reports CRUD API with search and pagination"
```

---

## Task 11: Evidence Attachment API

**Files:**
- Modify: `src/app/api/reports/[id]/route.ts` (add evidence to GET)

**Interfaces:**
- Consumes: evidence table
- Produces: Evidence included in single report GET response

- [ ] **Step 1: Evidence already included in Task 10 GET**

The GET /api/reports/[id] already fetches evidence. No additional changes needed.

- [ ] **Step 2: Create evidence attachment endpoint**

Create `src/app/api/reports/[id]/evidence/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { evidence, reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getUserIdFromRequest } from "@/lib/auth";
import { evidenceTypeEnum } from "@/lib/validations";

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

    // Check report exists and user owns it
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
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/reports/[id]/evidence/
git commit -m "feat: add evidence attachment endpoint"
```

---

## Task 12: Comments API

**Files:**
- Create: `src/app/api/reports/[id]/comments/route.ts`

**Interfaces:**
- Consumes: `createCommentSchema` from validations
- Consumes: `getUserIdFromRequest` from auth
- Produces: GET /api/reports/[id]/comments, POST /api/reports/[id]/comments

- [ ] **Step 1: Create `src/app/api/reports/[id]/comments/route.ts`**

```typescript
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
        { error: { message: parsed.error.errors[0].message, code: 400 } },
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
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/reports/[id]/comments/
git commit -m "feat: add comments API with pagination"
```

---

## Task 13: UI Components

**Files:**
- Create: `src/components/ui/button.tsx`, `input.tsx`, `textarea.tsx`, `badge.tsx`, `card.tsx`, `pagination.tsx`, `loading-spinner.tsx`, `toaster.tsx`

**Interfaces:**
- Produces: Reusable UI components with Tailwind styling

- [ ] **Step 1: Create UI components**

```typescript
// src/components/ui/button.tsx
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", loading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-500",
      ghost: "text-slate-600 hover:bg-slate-100 focus:ring-slate-500",
      danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

// src/components/ui/input.tsx
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// src/components/ui/textarea.tsx
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, error, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
            error ? "border-red-500" : ""
          } ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// src/components/ui/badge.tsx
interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
}

export function Badge({ variant = "default", children }: BadgeProps) {
  const variants = {
    default: "bg-slate-100 text-slate-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
}

// src/components/ui/card.tsx
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: CardProps) {
  return <div className={`p-6 border-b border-slate-200 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: CardProps) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

// src/components/ui/pagination.tsx
interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, total, limit, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 text-sm rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
      >
        Previous
      </button>
      <span className="text-sm text-slate-600">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 text-sm rounded-lg border border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50"
      >
        Next
      </button>
    </div>
  );
}

// src/components/ui/loading-spinner.tsx
export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

  return (
    <svg className={`animate-spin ${sizes[size]} text-blue-600`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// src/components/ui/toaster.tsx
"use client";

import { GooeyToaster } from "goey-toast";
import "goey-toast/styles.css";

export function Toaster() {
  return <GooeyToaster position="bottom-right" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add reusable UI components"
```

---

## Task 14: Layout Components

**Files:**
- Create: `src/components/layout/navbar.tsx`, `footer.tsx`

**Interfaces:**
- Consumes: `getCurrentUser` from auth (via client fetch)
- Produces: Navbar with auth state, Footer

- [ ] **Step 1: Create `src/components/layout/navbar.tsx`**

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { UserPayload } from "@/types";

export function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.data) setUser(data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">SafeBuy</span>
            <span className="text-sm text-slate-500">Forum</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/reports"
              className={`text-sm font-medium ${
                pathname === "/reports"
                  ? "text-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Reports
            </Link>

            {loading ? (
              <div className="h-8 w-20 bg-slate-100 rounded animate-pulse" />
            ) : user ? (
              <>
                <Link
                  href="/create-report"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Report Fraud
                </Link>
                <Link
                  href="/profile"
                  className={`text-sm font-medium ${
                    pathname === "/profile"
                      ? "text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Profile
                </Link>
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className={`text-sm font-medium ${
                      pathname.startsWith("/admin")
                        ? "text-blue-600"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create `src/components/layout/footer.tsx`**

```typescript
export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-slate-900">SafeBuy</span>
            <span className="text-sm text-slate-500">Forum</span>
          </div>
          <p className="text-sm text-slate-500">
            Helping consumers avoid e-commerce fraud
          </p>
          <p className="text-sm text-slate-400">
            &copy; {new Date().getFullYear()} SafeBuy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add navbar and footer components"
```

---

## Task 15: App Layout & Pages

**Files:**
- Modify: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `src/app/(auth)/login/page.tsx`, `register/page.tsx`
- Create: `src/app/(public)/reports/page.tsx`, `reports/[id]/page.tsx`
- Create: `src/app/(protected)/profile/page.tsx`, `create-report/page.tsx`

**Interfaces:**
- Consumes: All UI components, layout components
- Produces: All frontend pages

- [ ] **Step 1: Update `src/app/layout.tsx`**

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafeBuy Forum - Report E-commerce Fraud",
  description: "Community-driven platform to report and prevent e-commerce fraud",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Create `src/app/page.tsx` (Home)**

```typescript
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Report E-commerce Fraud
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Help others avoid scams. Share your experience, upload evidence, and
          build a safer shopping community.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/reports"
            className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Browse Reports
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 text-base font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create Login page**

```typescript
// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const verified = searchParams.get("verified");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        gooeyToast.error(data.error?.message || "Login failed");
        return;
      }

      gooeyToast.success("Logged in successfully");
      router.push("/");
      router.refresh();
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Login to SafeBuy
        </h1>

        {verified && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
            Email verified! You can now login.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Login
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-blue-600 hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create Register page**

```typescript
// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        gooeyToast.error(data.error?.message || "Registration failed");
        return;
      }

      gooeyToast.success("Check your email to verify your account");
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-slate-900 text-center mb-8">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
          <Button type="submit" loading={loading} className="w-full">
            Register
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create Reports list page**

```typescript
// src/app/(public)/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ReportCard } from "@/components/reports/report-card";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Report {
  id: string;
  title: string;
  description: string;
  platform: string;
  sellerName: string;
  status: string;
  createdAt: string;
  user: { id: string; name: string };
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const limit = 10;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (search) params.set("search", search);

    fetch(`/api/reports?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setReports(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Fraud Reports</h1>
        <Link
          href="/create-report"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Report Fraud
        </Link>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or seller name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">No reports found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
          <div className="mt-8">
            <Pagination
              page={page}
              total={total}
              limit={limit}
              onPageChange={setPage}
            />
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create Report detail page**

```typescript
// src/app/(public)/reports/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { EvidenceGallery } from "@/components/reports/evidence-gallery";
import { CommentSection } from "@/components/comments/comment-section";

interface Report {
  id: string;
  title: string;
  description: string;
  platform: string;
  sellerName: string;
  sellerUrl: string | null;
  status: string;
  createdAt: string;
  user: { id: string; name: string; reputationScore: number };
  evidence: { id: string; url: string; type: string }[];
}

const statusColors: Record<string, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  UNDER_REVIEW: "info",
  VERIFIED: "success",
  REJECTED: "danger",
};

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reports/${params.id}`)
      .then((res) => res.json())
      .then((data) => setReport(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Report not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={statusColors[report.status] || "default"}>
            {report.status.replace("_", " ")}
          </Badge>
          <span className="text-sm text-slate-500">{report.platform}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          {report.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Reported by {report.user.name}</span>
          <span>&middot;</span>
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-2">
          {report.sellerName}
        </h2>
        {report.sellerUrl && (
          <a
            href={report.sellerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline mb-4 block"
          >
            {report.sellerUrl}
          </a>
        )}
        <p className="text-slate-700 whitespace-pre-wrap">
          {report.description}
        </p>
      </div>

      {report.evidence.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Evidence</h2>
          <EvidenceGallery evidence={report.evidence} />
        </div>
      )}

      <CommentSection reportId={report.id} />
    </div>
  );
}
```

- [ ] **Step 7: Create Profile page**

```typescript
// src/app/(protected)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  reputationScore: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setUser(data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Not authenticated</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Profile</h1>
      <Card>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-500">Name</label>
              <p className="text-slate-900">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Email</label>
              <p className="text-slate-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">Role</label>
              <p className="text-slate-900">{user.role}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Reputation Score
              </label>
              <p className="text-2xl font-bold text-blue-600">
                {user.reputationScore}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-500">
                Member Since
              </label>
              <p className="text-slate-900">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 8: Create Create Report page**

```typescript
// src/app/(protected)/create-report/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

const platforms = ["Facebook", "Instagram", "Daraz", "Website", "WhatsApp", "Other"];

export default function CreateReportPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "Facebook",
    sellerName: "",
    sellerUrl: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        gooeyToast.error(data.error?.message || "Failed to create report");
        return;
      }

      gooeyToast.success("Report created successfully");
      router.push(`/reports/${data.data.id}`);
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">
        Report Fraud
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="Brief summary of the fraud"
          required
        />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Platform
          </label>
          <select
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {platforms.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Seller Name"
          value={form.sellerName}
          onChange={(e) => setForm({ ...form, sellerName: e.target.value })}
          placeholder="Name of the seller/shop"
          required
        />

        <Input
          label="Seller URL (optional)"
          value={form.sellerUrl}
          onChange={(e) => setForm({ ...form, sellerUrl: e.target.value })}
          placeholder="https://..."
          type="url"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe what happened in detail..."
          rows={6}
          required
        />

        <Button type="submit" loading={loading} className="w-full">
          Submit Report
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 9: Commit**

```bash
git add src/app/
git commit -m "feat: add all frontend pages (auth, reports, profile)"
```

---

## Task 16: Report Components

**Files:**
- Create: `src/components/reports/report-card.tsx`, `evidence-gallery.tsx`

**Interfaces:**
- Consumes: Report data types
- Produces: ReportCard component, EvidenceGallery component

- [ ] **Step 1: Create `src/components/reports/report-card.tsx`**

```typescript
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface ReportCardProps {
  report: {
    id: string;
    title: string;
    platform: string;
    sellerName: string;
    status: string;
    createdAt: string;
    user: { id: string; name: string };
  };
}

const statusColors: Record<string, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  UNDER_REVIEW: "info",
  VERIFIED: "success",
  REJECTED: "danger",
};

export function ReportCard({ report }: ReportCardProps) {
  return (
    <Link href={`/reports/${report.id}`}>
      <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant={statusColors[report.status] || "default"}>
            {report.status.replace("_", " ")}
          </Badge>
          <span className="text-xs text-slate-500">{report.platform}</span>
        </div>
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">
          {report.title}
        </h3>
        <p className="text-sm text-slate-600 mb-2">{report.sellerName}</p>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>by {report.user.name}</span>
          <span>{new Date(report.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: Create `src/components/reports/evidence-gallery.tsx`**

```typescript
"use client";

import { useState } from "react";

interface Evidence {
  id: string;
  url: string;
  type: string;
}

export function EvidenceGallery({ evidence }: { evidence: Evidence[] }) {
  const [selected, setSelected] = useState<Evidence | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {evidence.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 hover:border-blue-500 transition-colors"
          >
            <img
              src={item.url}
              alt={item.type}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/50 text-white text-xs rounded">
              {item.type.replace("_", " ")}
            </span>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selected.url}
              alt={selected.type}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setSelected(null)}
              className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/reports/
git commit -m "feat: add report card and evidence gallery components"
```

---

## Task 17: Comment Components

**Files:**
- Create: `src/components/comments/comment-section.tsx`, `comment-form.tsx`

**Interfaces:**
- Consumes: Comment API
- Produces: CommentSection (list + add form), CommentForm

- [ ] **Step 1: Create `src/components/comments/comment-section.tsx`**

```typescript
"use client";

import { useState, useEffect } from "react";
import { CommentForm } from "./comment-form";
import { Pagination } from "@/components/ui/pagination";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string };
}

export function CommentSection({ reportId }: { reportId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchComments = () => {
    setLoading(true);
    fetch(`/api/reports/${reportId}/comments?page=${page}&limit=${limit}`)
      .then((res) => res.json())
      .then((data) => {
        setComments(data.data || []);
        setTotal(data.pagination?.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchComments();
  }, [page, reportId]);

  const handleCommentAdded = () => {
    setPage(1);
    fetchComments();
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Comments ({total})
      </h2>

      <CommentForm reportId={reportId} onCommentAdded={handleCommentAdded} />

      {loading ? (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-slate-500 py-4">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-4 mt-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-slate-50 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-slate-900 text-sm">
                  {comment.user.name}
                </span>
                <span className="text-xs text-slate-500">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-slate-700">{comment.content}</p>
            </div>
          ))}
          <Pagination
            page={page}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/comments/comment-form.tsx`**

```typescript
"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { gooeyToast } from "goey-toast";

interface CommentFormProps {
  reportId: string;
  onCommentAdded: () => void;
}

export function CommentForm({ reportId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/reports/${reportId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data = await res.json();

      if (!res.ok) {
        gooeyToast.error(data.error?.message || "Failed to add comment");
        return;
      }

      setContent("");
      gooeyToast.success("Comment added");
      onCommentAdded();
    } catch {
      gooeyToast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        rows={3}
      />
      <Button type="submit" loading={loading} size="sm">
        Post Comment
      </Button>
    </form>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/comments/
git commit -m "feat: add comment section and form components"
```

---

## Task 18: Seed Script

**Files:**
- Create: `seed.ts`

**Interfaces:**
- Consumes: All schema, auth utilities
- Produces: Test data in database

- [ ] **Step 1: Create `seed.ts`**

```typescript
import { db } from "./src/lib/db";
import {
  users,
  reports,
  evidence,
  comments,
  votes,
} from "./src/lib/db/schema";
import { hashPassword } from "./src/lib/auth";

async function seed() {
  console.log("Seeding database...");

  // Create users
  const hashedPassword = await hashPassword("password123");

  const [admin] = await db
    .insert(users)
    .values({
      name: "Admin User",
      email: "admin@safebuy.com",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
    })
    .returning();

  const [moderator] = await db
    .insert(users)
    .values({
      name: "Moderator User",
      email: "mod@safebuy.com",
      password: hashedPassword,
      role: "MODERATOR",
      emailVerified: true,
    })
    .returning();

  const [regularUser] = await db
    .insert(users)
    .values({
      name: "Regular User",
      email: "user@safebuy.com",
      password: hashedPassword,
      role: "USER",
      emailVerified: true,
    })
    .returning();

  console.log("Created users:", admin.email, moderator.email, regularUser.email);

  // Create reports
  const reportData = [
    {
      title: "Fake iPhone seller on Facebook",
      description:
        "Seller claimed to sell original iPhone 15 Pro Max at 50% discount. After payment via bank transfer, seller blocked me and deleted the Facebook page.",
      platform: "Facebook" as const,
      sellerName: "TechDeals BD",
      sellerUrl: "https://facebook.com/techdealsbd",
      status: "VERIFIED" as const,
      userId: regularUser.id,
    },
    {
      title: "Daraz seller sent wrong product",
      description:
        "Ordered a Samsung Galaxy S24 but received a cheap knockoff. Seller refused to accept return. Daraz support was unhelpful.",
      platform: "Daraz" as const,
      sellerName: "MobileHub Official",
      sellerUrl: "https://daraz.pk/sellers/mobilehub",
      status: "PENDING" as const,
      userId: regularUser.id,
    },
    {
      title: "Instagram scam - fake brand store",
      description:
        "Instagram page 'LuxuryBrandOutlet' selling fake designer bags. Payment via WhatsApp. Product never delivered.",
      platform: "Instagram" as const,
      sellerName: "LuxuryBrandOutlet",
      status: "UNDER_REVIEW" as const,
      userId: moderator.id,
    },
    {
      title: "WhatsApp fraud - job scam",
      description:
        "Received WhatsApp message about work from home job. Asked for registration fee of 5000 BDT. After payment, no response.",
      platform: "WhatsApp" as const,
      sellerName: "QuickCash Jobs",
      status: "REJECTED" as const,
      userId: regularUser.id,
    },
    {
      title: "Fake electronics website",
      description:
        "Website 'cheapElectronics.com' advertises wholesale prices. Took payment but never delivered. Website now down.",
      platform: "Website" as const,
      sellerName: "Cheap Electronics",
      sellerUrl: "https://cheapelectronics.com",
      status: "VERIFIED" as const,
      userId: admin.id,
    },
    {
      title: "Instagram seller delivered damaged goods",
      description:
        "Ordered sneakers from Instagram seller. Received damaged shoes with no return policy. Seller blocks complaints.",
      platform: "Instagram" as const,
      sellerName: "SneakerKing BD",
      status: "PENDING" as const,
      userId: regularUser.id,
    },
    {
      title: "Facebook marketplace furniture scam",
      description:
        "Paid advance for furniture on Facebook Marketplace. Seller asked for full payment before delivery. Never received items.",
      platform: "Facebook" as const,
      sellerName: "HomeFurnish Deals",
      status: "PENDING" as const,
      userId: moderator.id,
    },
    {
      title: "Other platform - Telegram group scam",
      description:
        "Telegram crypto investment group promised 300% returns in 24 hours. After investing 20000 BDT, group admin disappeared.",
      platform: "Other" as const,
      sellerName: "CryptoGains Official",
      status: "UNDER_REVIEW" as const,
      userId: regularUser.id,
    },
  ];

  const createdReports = await db.insert(reports).values(reportData).returning();
  console.log(`Created ${createdReports.length} reports`);

  // Create evidence
  const evidenceData = [
    { reportId: createdReports[0].id, url: "https://res.cloudinary.com/demo/image/upload/sample.jpg", type: "SCREENSHOT" as const },
    { reportId: createdReports[0].id, url: "https://res.cloudinary.com/demo/image/upload/sample2.jpg", type: "CHAT_PROOF" as const },
    { reportId: createdReports[1].id, url: "https://res.cloudinary.com/demo/image/upload/sample3.jpg", type: "INVOICE" as const },
    { reportId: createdReports[2].id, url: "https://res.cloudinary.com/demo/image/upload/sample4.jpg", type: "SCREENSHOT" as const },
    { reportId: createdReports[4].id, url: "https://res.cloudinary.com/demo/image/upload/sample5.jpg", type: "SCREENSHOT" as const },
  ];

  await db.insert(evidence).values(evidenceData);
  console.log(`Created ${evidenceData.length} evidence records`);

  // Create comments
  const commentData = [
    { reportId: createdReports[0].id, userId: moderator.id, content: "This seller has multiple complaints. Verified." },
    { reportId: createdReports[0].id, userId: admin.id, content: "Report verified. Seller has been reported to authorities." },
    { reportId: createdReports[1].id, userId: regularUser.id, content: "Same thing happened to me with this seller!" },
    { reportId: createdReports[2].id, userId: regularUser.id, content: "I almost fell for this. Thanks for posting." },
    { reportId: createdReports[4].id, userId: moderator.id, content: "Website confirmed down. Scam verified." },
  ];

  await db.insert(comments).values(commentData);
  console.log(`Created ${commentData.length} comments`);

  // Create votes
  const voteData = [
    { reportId: createdReports[0].id, userId: moderator.id, voteType: "CONFIRM" as const },
    { reportId: createdReports[0].id, userId: admin.id, voteType: "CONFIRM" as const },
    { reportId: createdReports[1].id, userId: regularUser.id, voteType: "CONFIRM" as const },
    { reportId: createdReports[4].id, userId: regularUser.id, voteType: "CONFIRM" as const },
  ];

  await db.insert(votes).values(voteData);
  console.log(`Created ${voteData.length} votes`);

  console.log("Seed complete!");
}

seed().catch(console.error);
```

- [ ] **Step 2: Commit**

```bash
git add seed.ts
git commit -m "feat: add seed script with test data"
```

---

## Task 19: Final Integration & Testing

**Files:**
- Verify all files exist and are properly connected

**Interfaces:**
- All tasks complete

- [ ] **Step 1: Run TypeScript check**

```bash
npx tsc --noEmit
```

- [ ] **Step 2: Run lint**

```bash
npm run lint
```

- [ ] **Step 3: Build project**

```bash
npm run build
```

- [ ] **Step 4: Run seed**

```bash
npm run db:seed
```

- [ ] **Step 5: Test dev server**

```bash
npm run dev
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 1 MVP implementation"
```

---

## Summary

| Task | Description | Files |
|------|-------------|-------|
| 1 | Project scaffolding | package.json, configs |
| 2 | Database schema | schema.ts, db/index.ts |
| 3 | Validation schemas | validations.ts |
| 4 | Auth utilities | auth.ts, types |
| 5 | Auth API routes | api/auth/ |
| 6 | Email service | email.ts |
| 7 | Cloudinary upload | cloudinary.ts, api/upload/ |
| 8 | Rate limiting | rate-limit.ts |
| 9 | Auth middleware | middleware.ts |
| 10 | Reports API | api/reports/ |
| 11 | Evidence API | api/reports/[id]/evidence/ |
| 12 | Comments API | api/reports/[id]/comments/ |
| 13 | UI components | components/ui/ |
| 14 | Layout components | components/layout/ |
| 15 | App pages | app/ |
| 16 | Report components | components/reports/ |
| 17 | Comment components | components/comments/ |
| 18 | Seed script | seed.ts |
| 19 | Final integration | Build & test |

**Phase 1 delivers:** Auth system, fraud reports CRUD, evidence upload, comments, search, rate limiting, responsive UI.
