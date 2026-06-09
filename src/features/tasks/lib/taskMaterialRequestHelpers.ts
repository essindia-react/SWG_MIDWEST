import type { MaterialRequest, MaterialRequestStatus } from "../../site-material-request/types/materialRequest";
import { getMaterialRequests } from "../../site-material-request/lib/materialRequestStore";

function matchesTask(
  request: MaterialRequest,
  projectCode: string,
  taskId: string,
  taskName: string
): boolean {
  if (request.projectCode !== projectCode) return false;
  if (request.taskId) return request.taskId === taskId;
  return request.notes.includes(`Task: ${taskName}`);
}

export function getMaterialRequestsForTask(
  projectCode: string,
  taskId: string,
  taskName: string
): MaterialRequest[] {
  return getMaterialRequests().filter((request) =>
    matchesTask(request, projectCode, taskId, taskName)
  );
}

export const MATERIAL_REQUEST_STATUS_LABELS: Record<
  MaterialRequestStatus,
  { label: string; color: string; bg: string; message?: string }
> = {
  pending: { label: "Pending Review", color: "#D97706", bg: "#FFF7ED" },
  approved: {
    label: "Approved",
    color: "#2E7D32",
    bg: "#E8F5E9",
    message: "Await delivery",
  },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEF2F2" },
  info_requested: { label: "More Info Requested", color: "#0284C7", bg: "#EFF6FF" },
};
