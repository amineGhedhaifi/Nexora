import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notification.service";
import type { Notification } from "@/types/notification";

const NOTIFICATIONS_QUERY_KEY = ["notifications"];
const UNREAD_COUNT_QUERY_KEY = ["notifications", "unread-count"];

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: () => notificationService.getNotifications(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useUnreadCount() {
  return useQuery<number>({
    queryKey: UNREAD_COUNT_QUERY_KEY,
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      const previousUnreadCount = queryClient.getQueryData<number>(
        UNREAD_COUNT_QUERY_KEY,
      );

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        old?.map((n) => (n.id === id ? { ...n, isRead: true } : n)) ?? [],
      );

      queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, (old) =>
        old && old > 0 ? old - 1 : 0,
      );

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications,
        );
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          UNREAD_COUNT_QUERY_KEY,
          context.previousUnreadCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });

      const previousNotifications = queryClient.getQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
      );
      const previousUnreadCount = queryClient.getQueryData<number>(
        UNREAD_COUNT_QUERY_KEY,
      );

      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (old) =>
        old?.map((n) => ({ ...n, isRead: true })) ?? [],
      );

      queryClient.setQueryData<number>(UNREAD_COUNT_QUERY_KEY, 0);

      return { previousNotifications, previousUnreadCount };
    },
    onError: (_err, _id, context) => {
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          NOTIFICATIONS_QUERY_KEY,
          context.previousNotifications,
        );
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(
          UNREAD_COUNT_QUERY_KEY,
          context.previousUnreadCount,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
    },
  });
}

export function useInvalidateNotifications() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_QUERY_KEY });
  };
}