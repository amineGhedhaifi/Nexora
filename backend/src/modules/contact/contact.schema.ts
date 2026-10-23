import { z } from "zod";

export const contactTopics = [
  "GENERAL_INQUIRY",
  "PRODUCT_QUESTION",
  "ORDER_SUPPORT",
  "SHIPPING_DELIVERY",
  "RETURNS_REFUNDS",
  "TECHNICAL_ISSUE",
  "OTHER",
] as const;

export const createContactMessageSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(254),
  topic: z.enum(contactTopics),
  message: z.string().trim().min(10).max(5000),
});

export type CreateContactMessageInput = z.infer<
  typeof createContactMessageSchema
>;

export const contactMessageStatus = ["UNREAD", "READ", "RESOLVED"] as const;

export const adminContactMessagesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(200).default(""),

  status: z.enum(contactMessageStatus).optional(),

  topic: z.enum(contactTopics).optional(),
});

export const updateContactMessageStatusSchema = z.object({
  status: z.enum(contactMessageStatus),
});

export type AdminContactMessagesQuery = z.infer<
  typeof adminContactMessagesQuerySchema
>;

export type UpdateContactMessageStatusInput = z.infer<
  typeof updateContactMessageStatusSchema
>;
