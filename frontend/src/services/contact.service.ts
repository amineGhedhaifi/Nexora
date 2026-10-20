import type { ContactFormValues } from "@/schemas/contact.schema";

/**
 * Contact form submission.
 * Today: simulated, nothing is delivered.
 * Later: the Express API receives the message, emails it to the team and sends
 * the sender an automatic reply. Only this file changes.
 */

const MOCK_LATENCY_MS = 800;

export const contactService = {
  async sendMessage(input: ContactFormValues): Promise<void> {
    // TODO (backend): POST /api/contact
    void input;
    await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS));
  },
};
