export type MaterialRequestReason =
  | "Underestimated"
  | "Damaged Material"
  | "Change in Scope"
  | "Other";

export type MaterialRequestUrgency = "Same Day" | "Next Day" | "This Week";

export type MaterialRequestStatus = "pending" | "approved" | "rejected" | "info_requested";

export type ApprovalDecision = "Approve" | "Reject" | "Request More Info";

export type FulfillmentMethod =
  | "Pull from Inventory"
  | "Raise Purchase Order"
  | "Subcontractor Supply";

export interface MaterialRequest {
  id: string;
  requestNumber: string;
  projectCode: string;
  projectName: string;
  requestedBy: string;
  requestDateTime: string;
  taskId?: string;
  itemName: string;
  quantityNeeded: number;
  unit: string;
  reason: MaterialRequestReason;
  urgency: MaterialRequestUrgency;
  photoAttached: boolean;
  notes: string;
  status: MaterialRequestStatus;
  approvalDecision?: ApprovalDecision;
  fulfillmentMethod?: FulfillmentMethod;
  approvedQuantity?: number;
  notesToCrew?: string;
}

export interface MaterialRequestFormData {
  itemName: string;
  quantityNeeded: string;
  unit: string;
  reason: MaterialRequestReason | "";
  urgency: MaterialRequestUrgency | "";
  notes: string;
  photoAttached: boolean;
}
