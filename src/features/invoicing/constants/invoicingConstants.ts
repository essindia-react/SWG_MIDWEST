import type { InvoiceStatus, PaymentMethod, PaymentTerm } from "../../../types/invoice";

export const INVOICE_STATUS_OPTIONS: {
  value: InvoiceStatus;
  label: string;
  description: string;
}[] = [
  { value: "draft", label: "Draft", description: "Created but not sent" },
  { value: "sent", label: "Sent", description: "Emailed to client" },
  { value: "viewed", label: "Viewed", description: "Client opened the email" },
  { value: "paid", label: "Paid", description: "Payment received and recorded" },
  { value: "partially-paid", label: "Partially Paid", description: "Client paid part of invoice" },
  { value: "overdue", label: "Overdue", description: "Past due date, not fully paid" },
  { value: "void", label: "Void", description: "Cancelled invoice" },
];

export const PAYMENT_TERM_OPTIONS: PaymentTerm[] = ["Due on Receipt", "Net 15", "Net 30"];

export const PAYMENT_METHOD_OPTIONS: PaymentMethod[] = [
  "ACH",
  "Check",
  "Credit Card",
  "Zelle",
];

export const DEPARTMENT_CHECKLIST_ITEMS = [
  "Site Preparation Complete",
  "Installation Quality Verified",
  "Safety Inspection Passed",
  "Manager Sign-off",
] as const;

export const DEFAULT_TAX_PERCENT = 7.25;

export const DEFAULT_NOTES_TO_CLIENT =
  "Thank you for choosing Southwest Greens. Please remit payment by the due date listed above.";

export function invoiceStatusLabel(status: InvoiceStatus): string {
  return INVOICE_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function invoiceStatusDescription(status: InvoiceStatus): string {
  return INVOICE_STATUS_OPTIONS.find((o) => o.value === status)?.description ?? "";
}

export function invoiceStatusColor(status: InvoiceStatus): { bg: string; color: string } {
  const map: Record<InvoiceStatus, { bg: string; color: string }> = {
    draft: { bg: "#F1F5F9", color: "#475569" },
    sent: { bg: "#EFF6FF", color: "#0284C7" },
    viewed: { bg: "#F0F9FF", color: "#0369A1" },
    paid: { bg: "#E8F5E9", color: "#2E7D32" },
    "partially-paid": { bg: "#FFF7ED", color: "#D97706" },
    overdue: { bg: "#FEF2F2", color: "#DC2626" },
    void: { bg: "#F3F4F6", color: "#6B7280" },
  };
  return map[status];
}

export function paymentTermDays(term: PaymentTerm): number {
  if (term === "Net 15") return 15;
  if (term === "Net 30") return 30;
  return 0;
}
