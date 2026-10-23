import { apiRequest, ApiError } from "./api";
import type {
  ContactMessage,
  ContactMessagesResponse,
  ContactMessagesQuery,
  UpdateContactMessageStatusInput,
  ContactTopic,
  ContactMessageStatus,
} from "@/types/contact";

interface ContactMessageApi {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  status: string;
  createdAt: string;
}

interface ContactMessagesResponseApi {
  contactMessages: ContactMessageApi[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function toContactMessage(api: ContactMessageApi): ContactMessage {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    topic: api.topic as ContactTopic,
    message: api.message,
    status: api.status as ContactMessageStatus,
    createdAt: api.createdAt,
  };
}

export const adminContactService = {
  /** GET /api/contact/admin - requires admin auth. Returns paginated contact messages with optional filtering. */
  async getContactMessages(query: ContactMessagesQuery = {}): Promise<ContactMessagesResponse> {
    const searchParams = new URLSearchParams();
    if (query.page) searchParams.set("page", String(query.page));
    if (query.limit) searchParams.set("limit", String(query.limit));
    if (query.search) searchParams.set("search", query.search);
    if (query.status) searchParams.set("status", query.status);
    if (query.topic) searchParams.set("topic", query.topic);

    const response = await apiRequest<ContactMessagesResponseApi>(
      `/contact/admin?${searchParams.toString()}`,
      { auth: true },
    );

    return {
      contactMessages: response.contactMessages.map(toContactMessage),
      pagination: response.pagination,
    };
  },

  /** PATCH /api/contact/admin/:id/status - requires admin auth. Updates contact message status. */
  async updateContactMessageStatus(
    messageId: string,
    data: UpdateContactMessageStatusInput,
  ): Promise<ContactMessage> {
    const response = await apiRequest<{ contactMessage: ContactMessageApi }>(
      `/contact/admin/${messageId}/status`,
      {
        method: "PATCH",
        body: data,
        auth: true,
      },
    );
    return toContactMessage(response.contactMessage);
  },
};

export function isAdminContactApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}