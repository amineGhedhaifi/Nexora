import { z } from "zod";

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().trim().max(200).default(""),

  role: z.enum(["CLIENT", "ADMIN"]).optional(),
});

export type CustomerQuery = z.infer<typeof customerQuerySchema>;
