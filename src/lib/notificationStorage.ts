import { DUMMY_NOTIFICATIONS } from "../data/dummyNotifications";
import type { AppNotification } from "../types/notification";

export const NOTIFICATIONS_STORAGE_KEY = "swg-notifications";
const TTL_MS = 60 * 60 * 1000;

interface NotificationCache {
  expiresAt: number;
  notifications: AppNotification[];
}

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [...DUMMY_NOTIFICATIONS];

    const cache = JSON.parse(raw) as NotificationCache;
    if (Date.now() > cache.expiresAt) {
      localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
      return [...DUMMY_NOTIFICATIONS];
    }

    return cache.notifications.length > 0
      ? cache.notifications
      : [...DUMMY_NOTIFICATIONS];
  } catch {
    localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
    return [...DUMMY_NOTIFICATIONS];
  }
}

export function saveNotifications(notifications: AppNotification[]): void {
  const cache: NotificationCache = {
    expiresAt: Date.now() + TTL_MS,
    notifications,
  };
  localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(cache));
}
