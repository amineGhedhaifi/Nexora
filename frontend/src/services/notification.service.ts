import { apiRequest } from "./api";
import type {
  Notification,
  NotificationsResponse,
  UnreadCountResponse,
  MarkAsReadResponse,
  MarkAllAsReadResponse,
} from "@/types/notification";

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await apiRequest<NotificationsResponse>("/notifications", {
      auth: true,
    });
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiRequest<UnreadCountResponse>(
      "/notifications/unread-count",
      { auth: true },
    );
    return response.data.count;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiRequest<MarkAsReadResponse>(
      `/notifications/${id}/read`,
      {
        method: "PATCH",
        auth: true,
      },
    );
    return response.data;
  },

  async markAllAsRead(): Promise<number> {
    const response = await apiRequest<MarkAllAsReadResponse>(
      "/notifications/read-all",
      {
        method: "PATCH",
        auth: true,
      },
    );
    return response.data.updatedCount;
  },
};

export function isNotificationApiError(error: unknown): error is Error {
  return error instanceof Error;
}