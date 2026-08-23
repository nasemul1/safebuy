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
