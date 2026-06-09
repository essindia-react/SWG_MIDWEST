import { DUMMY_INVOICES } from "../data/dummyInvoices";
import type { Invoice } from "../types/invoice";

export const INVOICES_STORAGE_KEY = "swg-invoices";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface InvoicesCache {
  expiresAt: number;
  invoices: Invoice[];
}

const DUMMY_INVOICE_IDS = new Set(DUMMY_INVOICES.map((inv) => inv.id));

export function isUserAddedInvoice(invoice: Invoice): boolean {
  return !DUMMY_INVOICE_IDS.has(invoice.id);
}

export function loadInvoices(): Invoice[] {
  try {
    const raw = localStorage.getItem(INVOICES_STORAGE_KEY);
    if (!raw) return [...DUMMY_INVOICES];

    const cache = JSON.parse(raw) as InvoicesCache;
    if (Date.now() > cache.expiresAt) {
      localStorage.removeItem(INVOICES_STORAGE_KEY);
      return [...DUMMY_INVOICES];
    }

    const storedIds = new Set(cache.invoices.map((i) => i.id));
    const uniqueDummy = DUMMY_INVOICES.filter((i) => !storedIds.has(i.id));
    return [...cache.invoices, ...uniqueDummy];
  } catch {
    localStorage.removeItem(INVOICES_STORAGE_KEY);
    return [...DUMMY_INVOICES];
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  const userInvoices = invoices.filter(isUserAddedInvoice);
  const cache: InvoicesCache = {
    expiresAt: Date.now() + TTL_MS,
    invoices: userInvoices.length > 0 ? invoices : invoices.filter((i) => !isUserAddedInvoice(i)),
  };
  if (cache.invoices.length === 0) {
    localStorage.removeItem(INVOICES_STORAGE_KEY);
    return;
  }
  localStorage.setItem(INVOICES_STORAGE_KEY, JSON.stringify(cache));
}
