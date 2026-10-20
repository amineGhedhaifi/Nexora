import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Enter your email")
  .email("Enter a valid email address");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password"),
});

// Rules mirror the backend: name 2-100 characters, password 8-128 characters
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Enter your full name")
      .max(100, "Your name is too long"),
    email,
    password: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "Your password is too long"),
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
/** What the API receives (the confirmation field only exists in the form). */
export type RegisterInput = Omit<RegisterFormValues, "confirmPassword">;
