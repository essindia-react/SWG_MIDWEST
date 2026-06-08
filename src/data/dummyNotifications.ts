import type { AppNotification } from "../types/notification";

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const DUMMY_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "follow-up",
    title: "Follow-up overdue",
    message: "Henderson Estate — no contact in 5 days",
    createdAt: hoursAgo(1),
    read: false,
    leadId: "lead-1",
  },
  {
    id: "notif-2",
    type: "quote",
    title: "Quote approved",
    message: "Sunbelt Properties accepted the $72,000 proposal",
    createdAt: hoursAgo(3),
    read: false,
    leadId: "lead-7",
  },
  {
    id: "notif-3",
    type: "system",
    title: "Pipeline milestone",
    message: "Team crossed $750k in active pipeline value this week",
    createdAt: hoursAgo(5),
    read: true,
  },
];
