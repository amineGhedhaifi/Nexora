import { z } from "zod";
export const updateProfileSchema = z
    .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().max(255).optional(),
})
    .refine((data) => data.name !== undefined || data.email !== undefined, {
    message: "At least one field (name or email) must be provided.",
});
export const changePasswordSchema = z
    .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
        .string()
        .min(8, "New password must contain at least 8 characters.")
        .max(128, "New password must not exceed 128 characters."),
})
    .refine((data) => data.currentPassword !== data.newPassword, {
    message: "The new password must be different from the current password.",
    path: ["newPassword"],
});
