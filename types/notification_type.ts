export type NotificationType = "order" | "message" | "system";

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  content: string;
  image_url: string | null;
  is_read: boolean;
  reference_type: string | null;
  reference_id: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  currentPage: number;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  count: number;
}
