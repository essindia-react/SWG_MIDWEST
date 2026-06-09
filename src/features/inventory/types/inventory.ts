export type ProductCategory =
  | "Turf"
  | "Base Material"
  | "Infill"
  | "Edging"
  | "Adhesive"
  | "Equipment"
  | "Other";

export type ProductUnit = "sq ft" | "linear ft" | "roll" | "bag" | "unit";

export type InventoryType = "Stocked" | "Non-Inventory" | "Special Order";

export type ProductStatus = "Active" | "Inactive" | "Discontinued";

export interface InventoryProduct {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  unit: ProductUnit;
  unitCost: number;
  sellingPrice: number;
  inventoryType: InventoryType;
  reorderLevel: number;
  currentStock: number;
  preferredVendor: string;
  status: ProductStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | "Stock In"
  | "Project Allocation"
  | "Site Request"
  | "Product Swap"
  | "Adjustment";

export interface StockLedgerEntry {
  id: string;
  date: string;
  transactionType: TransactionType;
  productId: string;
  productName: string;
  projectId?: string;
  projectName?: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
  referenceNumber: string;
  createdBy: string;
  reason?: string;
  comments?: string;
  relatedDocuments?: string[];
  auditTrail?: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;
  user: string;
  details?: string;
}

export type MaterialRequestStatus =
  | "Pending"
  | "Approved"
  | "Partially Fulfilled"
  | "Fulfilled"
  | "Rejected";

export interface MaterialRequestItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  unit: ProductUnit;
  requestedQty: number;
  availableQty: number;
  allocatedQty: number;
  status: "Pending" | "Allocated" | "Partial" | "Fulfilled" | "Rejected";
}

export interface InventoryMaterialRequest {
  id: string;
  requestNo: string;
  requestDate: string;
  projectId: string;
  projectName: string;
  requestedBy: string;
  items: MaterialRequestItem[];
  status: MaterialRequestStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export type ProductSwapStatus =
  | "Draft"
  | "Pending"
  | "Approved"
  | "Completed"
  | "Cancelled";

export interface ProductSwap {
  id: string;
  swapNumber: string;
  date: string;
  projectId: string;
  projectName: string;
  milestone?: string;
  task?: string;
  oldProductId: string;
  oldProductName: string;
  newProductId: string;
  newProductName: string;
  quantity: number;
  unit: ProductUnit;
  status: ProductSwapStatus;
  createdBy: string;
  reason?: string;
  quantityReturned?: number;
  quantityRequired?: number;
  availableStock?: number;
  stockShortage?: number;
  costImpact?: number;
  approvalHistory?: AuditEntry[];
}

export interface ProductTransaction {
  id: string;
  date: string;
  type: TransactionType;
  quantity: number;
  reference: string;
  projectName?: string;
}
