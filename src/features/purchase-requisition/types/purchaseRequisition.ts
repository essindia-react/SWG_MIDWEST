export type POType =
  | "Materials"
  | "Equipment Rental"
  | "Shipping/Freight"
  | "Subcontractor"
  | "Other";

export type DeliveryAddress = "Job Site" | "Warehouse" | "Office";

export type PaymentTerms = "Net 30" | "Net 15" | "COD" | "Prepaid";

export type POLineItemUnit = "sq ft" | "roll" | "bag" | "unit";

export type POStatus =
  | "Draft"
  | "Sent to Vendor"
  | "Vendor Confirmed"
  | "Partially Received"
  | "Received"
  | "Cancelled";

export interface POLineItem {
  id: string;
  productId: string;
  itemName: string;
  sku: string;
  description: string;
  quantity: number;
  unit: POLineItemUnit;
  unitPrice: number;
  total: number;
}

export interface PurchaseRequisition {
  id: string;
  poNumber: string;
  poDate: string;
  poType: POType;
  linkedProjectId: string;
  linkedProjectName: string;
  linkedMaterialRequestNumber: string;
  vendorName: string;
  vendorContact: string;
  vendorEmail: string;
  deliveryAddress: DeliveryAddress;
  requiredDeliveryDate: string;
  paymentTerms: PaymentTerms;
  notesToVendor: string;
  lineItems: POLineItem[];
  status: POStatus;
  createdAt: string;
}

export interface PurchaseRequisitionFormState {
  poType: POType;
  linkedProjectId: string;
  linkedMaterialRequestNumber: string;
  vendorName: string;
  vendorContact: string;
  vendorEmail: string;
  deliveryAddress: DeliveryAddress;
  requiredDeliveryDate: string;
  paymentTerms: PaymentTerms;
  notesToVendor: string;
  lineItems: POLineItem[];
}
