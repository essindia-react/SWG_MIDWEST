import type { PurchaseRequisition } from "../types/purchaseRequisition";

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function generatePONumber(existing: PurchaseRequisition[]): string {
  const year = new Date().getFullYear();
  const prefix = `SWG-PO-${year}-`;
  const maxSeq = existing.reduce((max, pr) => {
    if (!pr.poNumber.startsWith(prefix)) return max;
    const seq = Number(pr.poNumber.slice(prefix.length));
    return Number.isFinite(seq) ? Math.max(max, seq) : max;
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}
