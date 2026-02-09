import { backendInstance } from "@/config/axios";
import {
  NotificationResponse,
  UnreadCountResponse,
} from "@/types/notification_type";

/**
 * Get paginated notifications
 */
export const getNotifications = async (
  page: number = 1,
  limit: number = 10,
): Promise<NotificationResponse> => {
  const response = await backendInstance.get("/notifications", {
    params: { page, limit },
  });
  // Backend returns: { message, data: [...notifications], pagination: { page, hasMore, ... } }
  const { data, pagination } = response.data;
  return {
    notifications: data,
    currentPage: pagination.page,
    hasMore: pagination.hasMore,
  };
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await backendInstance.get("/notifications/unread-count");
  // Backend returns: { message, data: { count: N } }
  return response.data.data;
};

/**
 * Mark single notification as read
 */
export const markNotificationAsRead = async (
  notificationId: number,
): Promise<void> => {
  await backendInstance.patch(`/notifications/${notificationId}/read`);
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await backendInstance.patch("/notifications/read-all");
};
