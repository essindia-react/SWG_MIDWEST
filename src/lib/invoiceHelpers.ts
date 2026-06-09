import { format, parseISO } from "date-fns";
import { getCustomerById } from "../features/projects/constants/projectConstants";
import { paymentTermDays } from "../features/invoicing/constants/invoicingConstants";
import type { Invoice, InvoiceFormInput, InvoiceLineItem, InvoiceStatus } from "../types/invoice";
import type { Project, ProjectMilestone } from "../types/project";

export function formatInvoiceDate(isoDate: string): string {
  if (!isoDate) return "—";
  try {
    return format(parseISO(isoDate), "dd-MM-yyyy");
  } catch {
    return isoDate;
  }
}

export function formatInvoiceCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function getMilestoneCompletionPct(milestone: ProjectMilestone): number {
  if (milestone.status === "completed") return 100;
  if (milestone.tasks.length === 0) {
    return milestone.status === "in-progress" ? 50 : 0;
  }
  const completed = milestone.tasks.filter((t) => t.status === "completed").length;
  return Math.round((completed / milestone.tasks.length) * 100);
}

export function getMilestoneWeight(
  milestone: ProjectMilestone,
  allMilestones: ProjectMilestone[]
): number {
  const totalEffort = allMilestones.reduce((sum, m) => sum + (m.estimateEffortHrs || 0), 0);
  if (totalEffort === 0) {
    return allMilestones.length > 0 ? Math.round(100 / allMilestones.length) : 0;
  }
  return Math.round(((milestone.estimateEffortHrs || 0) / totalEffort) * 100);
}

export function getMilestoneStatusCode(milestone: ProjectMilestone): "C" | "O" {
  return getMilestoneCompletionPct(milestone) === 100 ? "C" : "O";
}

export function getTaskCompletionPct(task: { status: string }): number {
  return task.status === "completed" ? 100 : task.status === "in-progress" ? 50 : 0;
}

export function getTaskStatusCode(task: { status: string }): "C" | "O" {
  return task.status === "completed" ? "C" : "O";
}

export function generateInvoiceNumber(existingInvoices: Invoice[]): string {
  const year = new Date().getFullYear();
  const prefix = `SWG-INV-${year}-`;
  const yearInvoices = existingInvoices.filter((inv) => inv.invoiceNumber.startsWith(prefix));
  const maxSeq = yearInvoices.reduce((max, inv) => {
    const seq = parseInt(inv.invoiceNumber.replace(prefix, ""), 10);
    return Number.isNaN(seq) ? max : Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(4, "0")}`;
}

export function calculateDueDate(invoiceDate: string, paymentTerms: Invoice["paymentTerms"]): string {
  const date = new Date(invoiceDate);
  date.setDate(date.getDate() + paymentTermDays(paymentTerms));
  return date.toISOString().slice(0, 10);
}

export function buildLineItems(
  project: Project,
  milestone: ProjectMilestone
): InvoiceLineItem[] {
  const weight = getMilestoneWeight(milestone, project.milestones);
  const milestoneAmount = (project.projectValue * weight) / 100;

  if (milestone.tasks.length === 0) {
    return [
      {
        id: `li-${milestone.id}-0`,
        description: `${milestone.name} — ${milestone.description || "Milestone work completed"}`,
        amount: milestoneAmount,
      },
    ];
  }

  const taskTotalEffort = milestone.tasks.reduce((sum, t) => sum + (t.estimateEffortHrs || 0), 0);
  return milestone.tasks.map((task, index) => {
    const share =
      taskTotalEffort > 0
        ? (task.estimateEffortHrs / taskTotalEffort) * milestoneAmount
        : milestoneAmount / milestone.tasks.length;
    return {
      id: `li-${milestone.id}-${index}`,
      description: `${task.name} (${milestone.name})`,
      amount: Math.round(share * 100) / 100,
    };
  });
}

export function getAmountPreviouslyPaid(
  projectId: string,
  milestoneId: string,
  invoices: Invoice[]
): number {
  return invoices
    .filter(
      (inv) =>
        inv.projectId === projectId &&
        inv.milestoneId !== milestoneId &&
        (inv.status === "paid" || inv.status === "partially-paid")
    )
    .reduce((sum, inv) => sum + (inv.status === "paid" ? inv.totalDue : inv.totalDue * 0.5), 0);
}

export function buildInvoiceFromInput(
  input: InvoiceFormInput,
  project: Project,
  milestone: ProjectMilestone,
  existingInvoices: Invoice[]
): Invoice {
  const now = new Date().toISOString();
  const today = now.slice(0, 10);
  const customer = getCustomerById(project.customerId);
  const lineItems = buildLineItems(project, milestone);
  const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
  const taxAmount = Math.round(subtotal * (input.taxPercent / 100) * 100) / 100;
  const totalDue = Math.round((subtotal + taxAmount) * 100) / 100;
  const amountPreviouslyPaid = getAmountPreviouslyPaid(
    project.id,
    milestone.id,
    existingInvoices
  );
  const balanceRemaining = Math.max(0, Math.round((totalDue - amountPreviouslyPaid) * 100) / 100);

  return {
    id: `inv-${Date.now()}`,
    invoiceNumber: generateInvoiceNumber(existingInvoices),
    projectId: project.id,
    milestoneId: milestone.id,
    status: "draft",
    invoiceDate: today,
    dueDate: calculateDueDate(today, input.paymentTerms),
    billToName: project.customerName,
    billToAddress: customer?.address ?? "",
    billToEmail: customer?.email ?? "",
    projectName: project.projectCode,
    jobSiteAddress: customer?.address ?? "",
    milestoneName: milestone.name,
    lineItems,
    subtotal,
    taxPercent: input.taxPercent,
    taxAmount,
    totalDue,
    amountPreviouslyPaid,
    balanceRemaining,
    paymentTerms: input.paymentTerms,
    paymentMethods: input.paymentMethods,
    notesToClient: input.notesToClient,
    internalNotes: input.internalNotes,
    completionRecord: input.completionRecord,
    createdAt: now,
    updatedAt: now,
  };
}

export function resolveInvoiceStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === "void" || invoice.status === "draft" || invoice.status === "sent" || invoice.status === "viewed") {
    return invoice.status;
  }
  const today = new Date().toISOString().slice(0, 10);
  if (invoice.status === "paid") return "paid";
  if (invoice.status === "partially-paid") {
    if (invoice.dueDate < today) return "overdue";
    return "partially-paid";
  }
  if (invoice.dueDate < today) return "overdue";
  return invoice.status;
}

export interface InvoicingMetrics {
  totalInvoices: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
  overdueCount: number;
  readyToInvoice: number;
  totalOutstanding: number;
  totalCollected: number;
}

export function calculateInvoicingMetrics(
  projects: Project[],
  invoices: Invoice[]
): InvoicingMetrics {
  const resolved = invoices.map((inv) => ({ ...inv, status: resolveInvoiceStatus(inv) }));

  let readyToInvoice = 0;
  for (const project of projects) {
    for (const milestone of project.milestones) {
      const completion = getMilestoneCompletionPct(milestone);
      const hasInvoice = invoices.some(
        (inv) => inv.projectId === project.id && inv.milestoneId === milestone.id
      );
      if (completion === 100 && !hasInvoice) readyToInvoice += 1;
    }
  }

  return {
    totalInvoices: invoices.length,
    draftCount: resolved.filter((i) => i.status === "draft").length,
    sentCount: resolved.filter((i) => i.status === "sent" || i.status === "viewed").length,
    paidCount: resolved.filter((i) => i.status === "paid").length,
    overdueCount: resolved.filter((i) => i.status === "overdue").length,
    readyToInvoice,
    totalOutstanding: resolved
      .filter((i) => ["sent", "viewed", "partially-paid", "overdue", "draft"].includes(i.status))
      .reduce((sum, i) => sum + i.balanceRemaining, 0),
    totalCollected: resolved
      .filter((i) => i.status === "paid" || i.status === "partially-paid")
      .reduce((sum, i) => sum + (i.status === "paid" ? i.totalDue : i.totalDue * 0.5), 0),
  };
}

export function isChecklistComplete(checklist: Record<string, boolean>): boolean {
  return Object.values(checklist).every(Boolean);
}
