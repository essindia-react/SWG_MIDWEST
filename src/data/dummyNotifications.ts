import type { AppNotification } from "../types/notification";

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

export const DUMMY_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "follow-up",
    title: "Follow-up due",
    message: "Henderson Estate — proposal follow-up scheduled today",
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
    type: "follow-up",
    title: "Estimate viewed",
    message: "Tony Rivera viewed the Rivera Pool & Turf hardscape estimate",
    createdAt: hoursAgo(4),
    read: false,
    leadId: "lead-6",
  },
  {
    id: "notif-4",
    type: "system",
    title: "Proposal sent",
    message: "Park Estates Dev. — putting green proposal awaiting board review",
    createdAt: hoursAgo(6),
    read: true,
    leadId: "lead-3",
  },
];
