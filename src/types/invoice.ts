export type InvoiceStatus = "draft" | "sent" | "paid";

export type PaymentTerm = "Due on Receipt" | "Net 15" | "Net 30";

export type PaymentMethod = "ACH" | "Check" | "Credit Card" | "Zelle";

export interface InvoiceLineItem {
  id: string;
  description: string;
  amount: number;
}

export interface MilestoneCompletionRecord {
  completionPct: number;
  markedCompleteBy: string;
  completionDate: string;
  completionPhotos: string[];
  checklistSignedOff: Record<string, boolean>;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  projectId: string;
  milestoneId: string;
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  billToName: string;
  billToAddress: string;
  billToEmail: string;
  projectName: string;
  jobSiteAddress: string;
  milestoneName: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalDue: number;
  amountPreviouslyPaid: number;
  balanceRemaining: number;
  paymentTerms: PaymentTerm;
  paymentMethods: PaymentMethod[];
  notesToClient: string;
  internalNotes: string;
  completionRecord: MilestoneCompletionRecord;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceFormInput {
  projectId: string;
  milestoneId: string;
  taxPercent: number;
  paymentTerms: PaymentTerm;
  paymentMethods: PaymentMethod[];
  notesToClient: string;
  internalNotes: string;
  completionRecord: MilestoneCompletionRecord;
}
