import { prisma } from "../../lib/prisma.js";

export async function getNotifications() {
  return prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getUnreadNotificationsCount() {
  return prisma.notification.count({
    where: {
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(id: string) {
  return prisma.notification.update({
    where: {
      id,
    },
    data: {
      isRead: true,
    },
  });
}

export async function markAllNotificationsAsRead() {
  return prisma.notification.updateMany({
    where: {
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
}
