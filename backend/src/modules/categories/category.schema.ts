import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "Category slug is required")
    .max(120)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase and use hyphens between words",
    ),
  description: z.string().trim().max(500).optional().nullable(),
});

export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
