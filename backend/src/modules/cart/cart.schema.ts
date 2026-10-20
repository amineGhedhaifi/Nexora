import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive().max(100),
});

export const cartItemParamsSchema = z.object({
  productId: z.string().uuid(),
});

export type AddCartItemInput = z.infer<typeof addCartItemSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
