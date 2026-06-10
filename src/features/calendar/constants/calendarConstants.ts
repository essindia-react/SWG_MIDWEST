import type { CalendarEventType } from "../../../types/calendar";

export const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  { label: string; color: string; bg: string }
> = {
  visit: { label: "Site Visit", color: "#D97706", bg: "#FFF7ED" },
  call: { label: "Phone Call", color: "#0284C7", bg: "#EFF6FF" },
  consultation: { label: "Consultation", color: "#7C3AED", bg: "#F5F3FF" },
  installation: { label: "Installation", color: "#16A34A", bg: "#F0FDF4" },
};

export const EVENT_TYPE_OPTIONS = (
  Object.entries(EVENT_TYPE_CONFIG) as [CalendarEventType, (typeof EVENT_TYPE_CONFIG)[CalendarEventType]][]
).map(([value, config]) => ({
  value,
  label: config.label,
}));
