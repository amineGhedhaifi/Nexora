import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(2).max(100),

  customerPhone: z.string().trim().min(6).max(30),

  shippingAddress: z.string().trim().min(5).max(300),

  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive().max(100),
      }),
    )
    .min(1)
    .max(50),
});

export const orderIdSchema = z.object({
  id: z.string().uuid(),
});

export const orderQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderIdInput = z.infer<typeof orderIdSchema>;
export type OrderQueryInput = z.infer<typeof orderQuerySchema>;
