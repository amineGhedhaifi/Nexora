import { apiRequest, ApiError, ValidationApiError, type ValidationError } from "./api";
import type { ContactFormValues } from "@/schemas/contact.schema";

export interface ContactTopic {
  value: string;
  label: string;
}

export const contactService = {
  async sendMessage(input: ContactFormValues): Promise<void> {
    await apiRequest("/contact", {
      method: "POST",
      body: input,
    });
  },

  async getTopics(): Promise<ContactTopic[]> {
    return apiRequest<ContactTopic[]>("/contact/topics");
  },
};

export function isContactApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isContactValidationError(
  error: unknown,
): error is ValidationApiError {
  return error instanceof ValidationApiError;
}

export function getValidationErrors(error: unknown): ValidationError[] {
  if (error instanceof ValidationApiError) {
    return error.errors;
  }
  return [];
}
