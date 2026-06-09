import type { InventoryProduct, StockLedgerEntry } from "../types/inventory";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function calculateProductMetrics(products: InventoryProduct[]) {
  const stocked = products.filter((p) => p.inventoryType === "Stocked");
  const specialOrder = products.filter((p) => p.inventoryType === "Special Order");
  const inventoryValue = stocked.reduce(
    (sum, p) => sum + p.currentStock * p.unitCost,
    0
  );

  return {
    totalProducts: products.length,
    inventoryValue,
    stockedProducts: stocked.length,
    specialOrderProducts: specialOrder.length,
  };
}

export function calculateLedgerMetrics(entries: StockLedgerEntry[], today = new Date()) {
  const todayStr = today.toISOString().slice(0, 10);

  const todayEntries = entries.filter((e) => e.date.startsWith(todayStr));

  const stockInToday = todayEntries
    .filter((e) => e.transactionType === "Stock In")
    .reduce((sum, e) => sum + e.quantity, 0);

  const stockOutToday = todayEntries
    .filter(
      (e) =>
        e.transactionType === "Project Allocation" ||
        e.transactionType === "Site Request"
    )
    .reduce((sum, e) => sum + Math.abs(e.quantity), 0);

  const adjustmentsToday = todayEntries.filter(
    (e) => e.transactionType === "Adjustment"
  ).length;

  return {
    stockInToday,
    stockOutToday,
    adjustmentsToday,
    totalTransactions: entries.length,
  };
}

export function isStockOutType(type: string): boolean {
  return type === "Project Allocation" || type === "Site Request";
}

export function generateSku(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `SKU-${num}`;
}

export function generateRequestNo(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `MR-INV-2026-${String(num).padStart(4, "0")}`;
}

export function generateSwapNumber(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `SWP-2026-${String(num).padStart(4, "0")}`;
}

export function generateTxnId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `txn-${num}`;
}

export function generateAdjRef(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `ADJ-2026-${String(num).padStart(4, "0")}`;
}
