import { DUMMY_INVOICES } from "../data/dummyInvoices";
import { DEMO_INVOICE_COUNT } from "../features/invoicing/constants/invoicingConstants";
import type { Invoice, InvoiceStatus } from "../types/invoice";

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

function normalizeInvoiceStatus(status: string): InvoiceStatus {
  if (status === "draft" || status === "sent" || status === "paid") return status;
  if (status === "viewed" || status === "partially-paid" || status === "overdue") {
    return "sent";
  }
  return "draft";
}

function normalizeInvoice(invoice: Invoice): Invoice {
  return {
    ...invoice,
    status: normalizeInvoiceStatus(invoice.status),
  };
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

    const userInvoices = cache.invoices
      .filter((invoice) => isUserAddedInvoice(invoice))
      .map(normalizeInvoice);

    const mergedDummy = DUMMY_INVOICES.map((dummy) => {
      const stored = cache.invoices.find((item) => item.id === dummy.id);
      return stored ? normalizeInvoice({ ...dummy, ...stored }) : dummy;
    });

    return [...userInvoices, ...mergedDummy]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, DEMO_INVOICE_COUNT);
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
