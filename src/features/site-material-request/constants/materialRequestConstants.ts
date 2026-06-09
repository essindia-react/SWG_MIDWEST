import type {
  ApprovalDecision,
  FulfillmentMethod,
  MaterialRequestReason,
  MaterialRequestUrgency,
} from "../types/materialRequest";

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
