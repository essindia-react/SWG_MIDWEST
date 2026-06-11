import type {
  ApprovalDecision,
  FulfillmentMethod,
  MaterialRequestReason,
  MaterialRequestStatus,
  MaterialRequestUrgency,
} from "../types/materialRequest";

export const SITE_MATERIAL_REQUEST_STATUS_CONFIG: Record<
  MaterialRequestStatus,
  { label: string; bg: string; color: string }
> = {
  pending: { label: "Pending Review", bg: "#FFF8E1", color: "#F57F17" },
  approved: { label: "Approved", bg: "#E8F5E9", color: "#2E7D32" },
  rejected: { label: "Rejected", bg: "#FFEBEE", color: "#C62828" },
  info_requested: { label: "More Info Requested", bg: "#E3F2FD", color: "#1565C0" },
};

export const MATERIAL_REQUEST_REASONS: MaterialRequestReason[] = [
  "Underestimated",
  "Damaged Material",
  "Change in Scope",
  "Other",
];

export const MATERIAL_REQUEST_URGENCIES: MaterialRequestUrgency[] = [
  "Same Day",
  "Next Day",
  "This Week",
];

export const APPROVAL_DECISIONS: ApprovalDecision[] = [
  "Approve",
  "Reject",
  "Request More Info",
];

export const FULFILLMENT_METHODS: FulfillmentMethod[] = [
  "Pull from Inventory",
  "Raise Purchase Order",
  "Subcontractor Supply",
];

export const DEMO_ACTIVE_JOB = {
  projectCode: "SWG-PROJ-2026-101",
  projectName: "John Smith — Backyard Turf Installation",
  crewMember: "Maria S.",
};

export const MATERIAL_REQUEST_UNITS = ["sq ft", "roll", "bag", "unit"] as const;
