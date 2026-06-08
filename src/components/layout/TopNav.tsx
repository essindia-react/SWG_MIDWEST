import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import {
  Bell,
  Search,
  Plus,
  ChevronDown,
  UserCircle,
  FileText,
  AlertCircle,
  CheckCheck,
} from "lucide-react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../lib/formatters";
import { ROUTES } from "../../routes/paths";
import type { AppNotification, NotificationType } from "../../types/notification";

interface TopNavProps {
  title: string;
  onCreateLead?: () => void;
}

const notificationIcons: Record<
  NotificationType,
  { icon: typeof Bell; color: string; bg: string }
> = {
  "new-lead": { icon: UserCircle, color: "var(--brand-green)", bg: "#F0FDF4" },
  "task-overdue": { icon: AlertCircle, color: "var(--status-red)", bg: "#FEF2F2" },
  quote: { icon: FileText, color: "var(--status-orange)", bg: "#FFF7ED" },
  "follow-up": { icon: AlertCircle, color: "var(--status-orange)", bg: "#FFF7ED" },
  system: { icon: Bell, color: "var(--status-blue)", bg: "#EFF6FF" },
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: AppNotification;
  onRead: () => void;
}) {
  const config = notificationIcons[notification.type];
  const Icon = config.icon;

  return (
    <button
      onClick={onRead}
      className="w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted"
      style={{
        backgroundColor: notification.read ? "transparent" : "#F0FDF4",
      }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: config.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: config.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className="text-foreground truncate"
          style={{ fontSize: "13px", fontWeight: notification.read ? 500 : 600 }}
        >
          {notification.title}
        </p>
        <p
          className="truncate"
          style={{ fontSize: "12px", color: "var(--muted-foreground)" }}
        >
          {notification.message}
        </p>
        <p style={{ fontSize: "11px", color: "var(--muted-foreground)", marginTop: 2 }}>
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <span
          className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
          style={{ backgroundColor: "var(--brand-green)" }}
        />
      )}
    </button>
  );
}

export function TopNav({ title, onCreateLead }: TopNavProps) {
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [panelOpen, setPanelOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    };
    if (panelOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [panelOpen]);

  const handleNotificationClick = (notification: AppNotification) => {
    markAsRead(notification.id);
    if (notification.type === "new-lead") {
      navigate(
        notification.leadId
          ? ROUTES.leadDetail(notification.leadId)
          : ROUTES.leads
      );
      setPanelOpen(false);
    }
  };

  return (
    <header
      className="flex items-center justify-between px-6 py-3 border-b bg-white"
      style={{ borderColor: "var(--border)", minHeight: "56px" }}
    >
      <div>
        <h1 className="text-foreground" style={{ fontSize: "16px", fontWeight: 600 }}>
          {title}
        </h1>
      </div>

      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search leads, customers, tasks..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border bg-white text-foreground placeholder:text-muted-foreground outline-none transition-all"
            style={{ fontSize: "13px", borderColor: "var(--border)" }}
            onFocus={(e) => {
              e.target.style.borderColor = "var(--brand-green)";
              e.target.style.boxShadow = "0 0 0 3px rgba(46,125,50,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "var(--border)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onCreateLead}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-all"
          style={{ backgroundColor: "var(--brand-green)", fontSize: "13px", fontWeight: 500 }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--brand-dark-green)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "var(--brand-green)")
          }
        >
          <Plus className="w-4 h-4" />
          New Lead
        </button>

        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setPanelOpen((open) => !open)}
            className="relative w-9 h-9 rounded-lg flex items-center justify-center border transition-colors hover:bg-muted"
            style={{ borderColor: "var(--border)" }}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 text-muted-foreground" />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-white"
                style={{
                  backgroundColor: "var(--status-red)",
                  fontSize: "10px",
                  fontWeight: 700,
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-xl border bg-white overflow-hidden z-50"
              style={{
                borderColor: "var(--border)",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--border)" }}
              >
                <span style={{ fontSize: "14px", fontWeight: 600 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
                    style={{ fontSize: "12px" }}
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p
                    className="px-4 py-6 text-center"
                    style={{ fontSize: "13px", color: "var(--muted-foreground)" }}
                  >
                    No notifications
                  </p>
                ) : (
                  notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onRead={() => handleNotificationClick(notification)}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors hover:bg-muted"
          style={{ borderColor: "var(--border)" }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: "var(--brand-green)", fontSize: "11px", fontWeight: 600 }}
          >
            AJ
          </div>
          <span style={{ fontSize: "13px", color: "var(--foreground)" }}>Alex J.</span>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
}
