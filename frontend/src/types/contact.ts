export type ContactMessageStatus = "UNREAD" | "READ" | "RESOLVED";

export type ContactTopic =
  | "GENERAL_INQUIRY"
  | "PRODUCT_QUESTION"
  | "ORDER_SUPPORT"
  | "SHIPPING_DELIVERY"
  | "RETURNS_REFUNDS"
  | "TECHNICAL_ISSUE"
  | "OTHER";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
}

export interface ContactMessagesPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactMessagesResponse {
  contactMessages: ContactMessage[];
  pagination: ContactMessagesPagination;
}

export interface ContactMessagesQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ContactMessageStatus;
  topic?: ContactTopic;
}

export interface UpdateContactMessageStatusInput {
  status: ContactMessageStatus;
}