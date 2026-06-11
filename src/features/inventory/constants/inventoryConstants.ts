import {
  ArrowLeftRight,
  BarChart3,
  Package,
  ScrollText,
  ShoppingCart,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export type InventoryTabId =
  | "master"
  | "stock-ledger"
  | "purchase-requisition"
  | "purchase-order"
  | "product-swaps"
  | "reports";

export interface InventoryTab {
  id: InventoryTabId;
  label: string;
  icon: LucideIcon;
}

export type InventorySidebarItem =
  | { type: "heading"; label: string }
  | { type: "tab"; tab: InventoryTab };

export const INVENTORY_TABS: InventoryTab[] = [
  { id: "master", label: "Master", icon: Package },
  { id: "stock-ledger", label: "Stock Ledger", icon: ScrollText },
  { id: "purchase-requisition", label: "Purchase Requisition", icon: ShoppingCart },
  { id: "purchase-order", label: "Purchase Order", icon: ClipboardList },
  { id: "product-swaps", label: "Product Swaps", icon: ArrowLeftRight },
  { id: "reports", label: "Inventory Reports", icon: BarChart3 },
];

export const INVENTORY_SIDEBAR: InventorySidebarItem[] = [
  { type: "heading", label: "Inventory" },
  ...INVENTORY_TABS.map((tab) => ({ type: "tab" as const, tab })),
];

export const PRODUCT_CATEGORIES = [
  "Turf",
  "Base Material",
  "Infill",
  "Edging",
  "Adhesive",
  "Equipment",
  "Other",
] as const;

export const PRODUCT_UNITS = ["sq ft", "linear ft", "roll", "bag", "unit"] as const;

export const INVENTORY_TYPES = ["Stocked", "Non-Inventory", "Special Order"] as const;

export const PRODUCT_STATUSES = ["Active", "Inactive", "Discontinued"] as const;

export const VENDORS = [
  "Southwest Turf Supply",
  "GreenBase Materials Co.",
  "ProEdge Landscaping",
  "Aggregate Direct LLC",
  "TurfPro Distributors",
  "Landscape Depot",
] as const;

export const TRANSACTION_TYPE_COLORS: Record<
  string,
  { bg: string; color: string }
> = {
  "Stock In": { bg: "#E8F5E9", color: "#2E7D32" },
  "Project Allocation": { bg: "#FFEBEE", color: "#C62828" },
  "Site Request": { bg: "#FFEBEE", color: "#C62828" },
  "Purchase Order": { bg: "#F3E5F5", color: "#6A1B9A" },
  "Product Swap": { bg: "#E3F2FD", color: "#1565C0" },
  Adjustment: { bg: "#FFF3E0", color: "#E65100" },
};

export const MATERIAL_REQUEST_STATUS_COLORS: Record<
  string,
  { bg: string; color: string }
> = {
  Pending: { bg: "#FFF8E1", color: "#F57F17" },
  Approved: { bg: "#E8F5E9", color: "#2E7D32" },
  "Partially Fulfilled": { bg: "#E3F2FD", color: "#1565C0" },
  Fulfilled: { bg: "#E8F5E9", color: "#1B5E20" },
  Rejected: { bg: "#FFEBEE", color: "#C62828" },
};

export const SWAP_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  Draft: { bg: "#F5F5F5", color: "#616161" },
  Pending: { bg: "#FFF8E1", color: "#F57F17" },
  Approved: { bg: "#E3F2FD", color: "#1565C0" },
  Completed: { bg: "#E8F5E9", color: "#2E7D32" },
  Cancelled: { bg: "#FFEBEE", color: "#C62828" },
};

export const ADJUSTMENT_REASONS = [
  "Physical Count Correction",
  "Damaged Goods",
  "Expired Material",
  "Theft / Loss",
  "Return to Vendor",
  "Other",
] as const;
