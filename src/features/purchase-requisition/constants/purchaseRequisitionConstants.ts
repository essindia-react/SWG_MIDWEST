import type {
  DeliveryAddress,
  PaymentTerms,
  POStatus,
  POType,
  POLineItemUnit,
} from "../types/purchaseRequisition";

export const PO_TYPES: readonly POType[] = [
  "Materials",
  "Equipment Rental",
  "Shipping/Freight",
  "Subcontractor",
  "Other",
] as const;

export const DELIVERY_ADDRESSES: readonly DeliveryAddress[] = [
  "Job Site",
  "Warehouse",
  "Office",
] as const;

export const PAYMENT_TERMS: readonly PaymentTerms[] = [
  "Net 30",
  "Net 15",
  "COD",
  "Prepaid",
] as const;

export const PO_LINE_ITEM_UNITS: readonly POLineItemUnit[] = [
  "sq ft",
  "roll",
  "bag",
  "unit",
] as const;

export const PO_STATUS_COLORS: Record<POStatus, { bg: string; color: string }> = {
  Draft: { bg: "#F5F5F5", color: "#616161" },
  "Sent to Vendor": { bg: "#E3F2FD", color: "#1565C0" },
  "Vendor Confirmed": { bg: "#FFF8E1", color: "#F57F17" },
  "Partially Received": { bg: "#FFF3E0", color: "#E65100" },
  Received: { bg: "#E8F5E9", color: "#2E7D32" },
  Cancelled: { bg: "#FFEBEE", color: "#C62828" },
};

export const PO_STATUSES: readonly POStatus[] = [
  "Draft",
  "Sent to Vendor",
  "Vendor Confirmed",
  "Partially Received",
  "Received",
  "Cancelled",
] as const;

export interface VendorDetail {
  contact: string;
  email: string;
}

export const VENDOR_DETAILS: Record<string, VendorDetail> = {
  "Southwest Turf Supply": {
    contact: "Mike Rivera",
    email: "orders@southwestturf.com",
  },
  "GreenBase Materials Co.": {
    contact: "Sarah Chen",
    email: "procurement@greenbase.com",
  },
  "ProEdge Landscaping": {
    contact: "James Ortiz",
    email: "sales@proedge-land.com",
  },
  "Aggregate Direct LLC": {
    contact: "Tom Walsh",
    email: "dispatch@aggregatedirect.com",
  },
  "TurfPro Distributors": {
    contact: "Lisa Nguyen",
    email: "orders@turfpro.com",
  },
  "Landscape Depot": {
    contact: "Chris Parker",
    email: "purchasing@landscapedepot.com",
  },
};
