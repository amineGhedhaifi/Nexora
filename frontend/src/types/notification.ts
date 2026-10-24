export type NotificationType = "NEW_ORDER" | "NEW_MESSAGE";

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
}

export interface UnreadCountResponse {
  success: boolean;
  data: { count: number };
}

export interface MarkAsReadResponse {
  success: boolean;
  data: Notification;
}

export interface MarkAllAsReadResponse {
  success: boolean;
  message: string;
  data: { updatedCount: number };
}