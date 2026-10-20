import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email")
    .email("Enter a valid email address"),
  topic: z.string().min(1, "Choose a topic"),
  message: z
    .string()
    .trim()
    .min(10, "Your message should be at least 10 characters")
    .max(1000, "Please keep your message under 1000 characters"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
