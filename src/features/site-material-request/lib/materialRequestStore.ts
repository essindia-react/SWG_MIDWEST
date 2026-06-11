import { fulfillSiteMaterialRequest } from "../../../lib/inventoryIntegration";
import type { MaterialRequest } from "../types/materialRequest";

const STORAGE_KEY = "swg-material-requests";
const VERSION_KEY = "swg-material-requests-version";
const CURRENT_VERSION = "3";

function readRequests(): MaterialRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MaterialRequest[]) : [];
  } catch {
    return [];
  }
}

function writeRequests(requests: MaterialRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function nextRequestNumber(existing: MaterialRequest[]): string {
  const year = new Date().getFullYear();
  const prefix = `SWG-MR-${year}-`;
  const maxSeq = existing.reduce((max, request) => {
    if (!request.requestNumber.startsWith(prefix)) return max;
    const seq = Number(request.requestNumber.slice(prefix.length));
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

export function getMaterialRequests(): MaterialRequest[] {
  return readRequests().sort(
    (a, b) => new Date(b.requestDateTime).getTime() - new Date(a.requestDateTime).getTime()
  );
}

export function getMaterialRequestById(id: string): MaterialRequest | undefined {
  return readRequests().find((request) => request.id === id);
}

export interface MaterialRequestContext {
  projectCode: string;
  projectName: string;
  requestedBy: string;
  taskId?: string;
  taskName?: string;
}

export function createMaterialRequest(
  data: Omit<
    MaterialRequest,
    | "id"
    | "requestNumber"
    | "projectCode"
    | "projectName"
    | "requestedBy"
    | "requestDateTime"
    | "status"
  >,
  context?: MaterialRequestContext
): MaterialRequest {
  const existing = readRequests();
  const projectCode = context?.projectCode ?? "";
  const projectName = context?.projectName ?? "";
  const requestedBy = context?.requestedBy ?? "Field Crew";
  const notes =
    context?.taskName && data.notes
      ? `Task: ${context.taskName}\n${data.notes}`
      : context?.taskName
        ? `Task: ${context.taskName}`
        : data.notes;

  const request: MaterialRequest = {
    id: `mr-${Date.now()}`,
    requestNumber: nextRequestNumber(existing),
    projectCode,
    projectName,
    requestedBy,
    requestDateTime: new Date().toISOString(),
    status: "pending",
    ...data,
    notes,
    taskId: context?.taskId,
  };
  writeRequests([request, ...existing]);
  window.dispatchEvent(new Event("material-requests-updated"));
  return request;
}

export function updateMaterialRequest(
  id: string,
  updates: Partial<MaterialRequest>
): MaterialRequest | undefined {
  const existing = readRequests();
  const index = existing.findIndex((request) => request.id === id);
  if (index === -1) return undefined;

  const updated = { ...existing[index], ...updates };
  existing[index] = updated;
  writeRequests(existing);
  window.dispatchEvent(new Event("material-requests-updated"));
  return updated;
}

/** Approve/reject a request and run inventory + PO fulfillment when approved. */
export function processMaterialRequestDecision(
  id: string,
  updates: Partial<MaterialRequest>
): MaterialRequest | undefined {
  let updated = updateMaterialRequest(id, updates);
  if (!updated || updated.status !== "approved" || !updated.fulfillmentMethod) {
    return updated;
  }

  updated = fulfillSiteMaterialRequest(updated);
  if (updated.linkedPONumber) {
    updated = updateMaterialRequest(id, { linkedPONumber: updated.linkedPONumber }) ?? updated;
  }
  return updated;
}

/** Demo requests submitted from Task Management → Material Request. */
const TASK_LINKED_SEED_REQUESTS: Omit<
  MaterialRequest,
  "id" | "requestNumber" | "requestDateTime"
>[] = [
  {
    projectCode: "SWG-PROJ-2026-101",
    projectName: "Henderson Estate — Pet & Dog Turf",
    requestedBy: "Chris W.",
    taskId: "p1-task-2",
    itemName: "Seam Tape Roll",
    quantityNeeded: 2,
    unit: "roll",
    reason: "Underestimated",
    urgency: "Next Day",
    photoAttached: false,
    notes: "Task: Compact base and lay turf rolls\nNeed extra seam tape for patio edge seaming.",
    status: "pending",
  },
  {
    projectCode: "SWG-PROJ-2026-101",
    projectName: "Henderson Estate — Pet & Dog Turf",
    requestedBy: "Alex J.",
    taskId: "p1-task-3",
    itemName: "Silica Sand Infill 50lb",
    quantityNeeded: 6,
    unit: "bag",
    reason: "Change in Scope",
    urgency: "This Week",
    photoAttached: true,
    notes: "Task: Infill, seaming, and edging finish\nClient added putting-green fringe — need additional infill.",
    status: "approved",
    approvalDecision: "Approve",
    fulfillmentMethod: "Pull from Inventory",
    approvedQuantity: 6,
    notesToCrew: "Pull from warehouse aisle B — approved for pickup tomorrow.",
  },
  {
    projectCode: "SWG-PROJ-2026-102",
    projectName: "Sunbelt Properties — Sports Turf",
    requestedBy: "Maria S.",
    taskId: "p2-task-4",
    itemName: "Premium Landscape Turf 15mm",
    quantityNeeded: 400,
    unit: "sq ft",
    reason: "Damaged Material",
    urgency: "Same Day",
    photoAttached: true,
    notes: "Task: Install sports turf rolls\nDamaged roll during delivery — need replacement section.",
    status: "info_requested",
    approvalDecision: "Request More Info",
    notesToCrew: "Please attach photo of damaged roll label and lot number.",
  },
  {
    projectCode: "SWG-PROJ-2026-102",
    projectName: "Sunbelt Properties — Sports Turf",
    requestedBy: "Alex J.",
    taskId: "p2-task-5",
    itemName: "Silica Sand Infill 50lb",
    quantityNeeded: 10,
    unit: "bag",
    reason: "Underestimated",
    urgency: "Next Day",
    photoAttached: false,
    notes: "Task: Spread cooling infill and groom field\nInfill quantity short after grooming pass.",
    status: "rejected",
    approvalDecision: "Reject",
    notesToCrew: "Use remaining stock from milestone pick list allocation before reordering.",
  },
  {
    projectCode: "SWG-PROJ-2026-101",
    projectName: "Henderson Estate — Pet & Dog Turf",
    requestedBy: "Chris W.",
    taskId: "p1-task-2",
    itemName: "Aluminum Edging 8ft",
    quantityNeeded: 120,
    unit: "linear ft",
    reason: "Underestimated",
    urgency: "This Week",
    photoAttached: false,
    notes: "Task: Compact base and lay turf rolls\nAdditional edging needed along patio transition.",
    status: "approved",
    approvalDecision: "Approve",
    fulfillmentMethod: "Raise Purchase Order",
    approvedQuantity: 120,
    notesToCrew: "PO raised — vendor delivery expected within 3 business days.",
  },
];

export function resetAndSeedMaterialRequests(): void {
  if (localStorage.getItem(VERSION_KEY) === CURRENT_VERSION) return;

  const year = new Date().getFullYear();
  const prefix = `SWG-MR-${year}-`;

  const seeded: MaterialRequest[] = TASK_LINKED_SEED_REQUESTS.map((request, index) => ({
    ...request,
    id: `mr-seed-${index + 1}`,
    requestNumber: `${prefix}${String(index + 1).padStart(4, "0")}`,
    requestDateTime: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
  }));

  const fulfilled = seeded.map((request) =>
    request.status === "approved" && request.fulfillmentMethod
      ? fulfillSiteMaterialRequest(request)
      : request
  );
  writeRequests(fulfilled);
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  window.dispatchEvent(new Event("material-requests-updated"));
}

/** @deprecated use resetAndSeedMaterialRequests */
export function seedDemoMaterialRequestIfEmpty(): void {
  resetAndSeedMaterialRequests();
}
