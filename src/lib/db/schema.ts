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
