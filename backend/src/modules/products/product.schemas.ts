import { z } from "zod";

const productFields = {
  name: z.string().trim().min(1).max(150),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().min(1),
  price: z.coerce.number().positive().finite(),
  stock: z.number().int().nonnegative(),
  categoryId: z.string().uuid(),
  isActive: z.boolean(),
};

export const createProductSchema = z.object({
  name: productFields.name,
  slug: productFields.slug,
  description: productFields.description,
  price: productFields.price,
  stock: productFields.stock.optional(),
  categoryId: productFields.categoryId,
  isActive: productFields.isActive.optional(),
});

export const updateProductSchema = z
  .object({
    name: productFields.name.optional(),
    slug: productFields.slug.optional(),
    description: productFields.description.optional(),
    price: productFields.price.optional(),
    stock: productFields.stock.optional(),
    categoryId: productFields.categoryId.optional(),
    isActive: productFields.isActive.optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export const productParamsSchema = z.object({
  id: z.string().uuid(),
});

export const productSlugParamsSchema = z.object({
  slug: productFields.slug,
});

export const productQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export const adminProductQuerySchema = z.object({
  category: z.string().trim().min(1).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
