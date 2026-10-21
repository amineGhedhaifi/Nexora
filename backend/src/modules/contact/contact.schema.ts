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
