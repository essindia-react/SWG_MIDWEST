export const MATERIAL_UNITS = ["sq ft", "linear ft", "roll", "bag", "unit"] as const;

export const MATERIAL_SOURCES = ["From Inventory", "Purchase Required"] as const;

export const WORK_TYPES = ["Regular", "Overtime", "Subcontract"] as const;

export const OVERHEAD_CATEGORIES = [
  "Permit",
  "Disposal",
  "Travel",
  "Subcontractor",
  "Miscellaneous",
] as const;

import { getProducts } from "../../inventory/lib/inventoryStore";

export interface InventoryCatalogItem {
  name: string;
  sku: string;
  unit: string;
  unitCost: number;
}

/** @deprecated use getInventoryCatalogItems() — kept for static fallbacks */
export const INVENTORY_ITEMS = [
  { name: "Premium Landscape Turf 15mm", sku: "TURF-PREM-15", unit: "sq ft", unitCost: 4.25 },
  { name: "Putting Green Turf", sku: "TURF-PG-12", unit: "sq ft", unitCost: 6.5 },
  { name: "Drainage Mat Roll", sku: "DRN-MAT-01", unit: "roll", unitCost: 185 },
  { name: "Crushed Aggregate Base", sku: "AGG-CRUSH-01", unit: "bag", unitCost: 12.75 },
  { name: "Landscape Nails Box", sku: "NAIL-LND-BOX", unit: "unit", unitCost: 28 },
  { name: "Seam Tape Roll", sku: "TAPE-SEAM-01", unit: "roll", unitCost: 42 },
  { name: "Silica Sand Infill 50lb", sku: "INFILL-SIL-50", unit: "bag", unitCost: 18.5 },
  { name: "Aluminum Edging 8ft", sku: "EDGE-ALU-8", unit: "linear ft", unitCost: 3.2 },
] as const;

/** Active stocked inventory products — sole source for project material planning. */
export function getInventoryCatalogItems(): InventoryCatalogItem[] {
  return getProducts()
    .filter(
      (product) =>
        product.status === "Active" && product.inventoryType !== "Non-Inventory"
    )
    .map((product) => ({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      unitCost: product.unitCost,
    }));
}

export const BUDGET_EMPLOYEES = [
  { name: "Maria S.", role: "Crew Leader", hourlyRate: 38 },
  { name: "Alex J.", role: "Site Supervisor", hourlyRate: 40 },
  { name: "Chris W.", role: "Installer", hourlyRate: 30 },
  { name: "Carlos R.", role: "Estimator", hourlyRate: 36 },
  { name: "Emily C.", role: "Site Supervisor", hourlyRate: 40 },
] as const;

export const EQUIPMENT_ITEMS = [
  { name: "Mini Excavator", dailyRate: 350 },
  { name: "Plate Compactor", dailyRate: 85 },
  { name: "Dump Trailer", dailyRate: 120 },
  { name: "Skid Steer Loader", dailyRate: 280 },
  { name: "Power Broom", dailyRate: 65 },
] as const;

export function getInventoryItem(name: string) {
  return getInventoryCatalogItems().find((item) => item.name === name);
}

export function getBudgetEmployee(name: string) {
  return BUDGET_EMPLOYEES.find((emp) => emp.name === name);
}

export function getEquipmentItem(name: string) {
  return EQUIPMENT_ITEMS.find((item) => item.name === name);
}
