import { z } from "zod";

export const checkoutSchema = z.object({
  firstName: z.string().trim().min(1, "Enter your first name"),
  lastName: z.string().trim().min(1, "Enter your last name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(1, "Enter your phone number")
    .regex(/^[+\d][\d\s().-]{6,19}$/, "Enter a valid phone number"),
  address: z.string().trim().min(5, "Enter your street address"),
  city: z.string().trim().min(2, "Enter your city"),
  postalCode: z
    .string()
    .trim()
    .min(3, "Enter your postal code")
    .max(12, "Postal code is too long"),
  country: z.string().min(1, "Select your country"),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
