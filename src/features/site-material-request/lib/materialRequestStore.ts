import type { MaterialRequest } from "../types/materialRequest";
import { DEMO_ACTIVE_JOB } from "../constants/materialRequestConstants";

const STORAGE_KEY = "swg-material-requests";

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
  const projectCode = context?.projectCode ?? DEMO_ACTIVE_JOB.projectCode;
  const projectName = context?.projectName ?? DEMO_ACTIVE_JOB.projectName;
  const requestedBy = context?.requestedBy ?? DEMO_ACTIVE_JOB.crewMember;
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

export function seedDemoMaterialRequestIfEmpty(): void {
  if (readRequests().length > 0) return;

  createMaterialRequest({
    itemName: "Drainage Mat Roll",
    quantityNeeded: 3,
    unit: "roll",
    reason: "Underestimated",
    urgency: "Next Day",
    photoAttached: false,
    notes: "Slope area larger than estimated — need extra drainage mat.",
  });
}
