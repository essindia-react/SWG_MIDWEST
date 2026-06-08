export type NotificationType =
  | "new-lead"
  | "task-overdue"
  | "quote"
  | "follow-up"
  | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  leadId?: string;
}

export type NotificationInput = Omit<AppNotification, "id" | "createdAt" | "read"> & {
  read?: boolean;
};
