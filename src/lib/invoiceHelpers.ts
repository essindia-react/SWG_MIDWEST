import { format, parseISO } from "date-fns";
import { getCustomerById } from "../features/projects/constants/projectConstants";
import {
  invoiceStatusLabel,
  paymentTermDays,
} from "../features/invoicing/constants/invoicingConstants";
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
        inv.status === "paid",
    )
    .reduce((sum, inv) => sum + inv.totalDue, 0);
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
  return invoice.status;
}

export interface InvoicingMetrics {
  totalInvoices: number;
  draftCount: number;
  sentCount: number;
  paidCount: number;
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
    sentCount: resolved.filter((i) => i.status === "sent").length,
    paidCount: resolved.filter((i) => i.status === "paid").length,
    readyToInvoice,
    totalOutstanding: resolved
      .filter((i) => i.status === "sent" || i.status === "draft")
      .reduce((sum, i) => sum + i.balanceRemaining, 0),
    totalCollected: resolved
      .filter((i) => i.status === "paid")
      .reduce((sum, i) => sum + i.totalDue, 0),
  };
}

export function isChecklistComplete(checklist: Record<string, boolean>): boolean {
  return Object.values(checklist).every(Boolean);
}

export function buildSnapshotMilestoneFromInvoice(invoice: Invoice): ProjectMilestone {
  return {
    id: invoice.milestoneId,
    name: invoice.milestoneName,
    description: invoice.milestoneName,
    assignedTo: invoice.completionRecord.markedCompleteBy,
    plannedStartDate: invoice.invoiceDate,
    plannedEndDate: invoice.dueDate,
    estimateEffortHrs: Math.max(invoice.lineItems.length, 1),
    status: "completed",
    tasks: invoice.lineItems.map((lineItem, index) => ({
      id: `snapshot-${invoice.id}-task-${index}`,
      milestoneId: invoice.milestoneId,
      name: lineItem.description,
      estimateEffortHrs: 1,
      plannedStartDate: invoice.invoiceDate,
      plannedEndDate: invoice.dueDate,
      assignedTo: invoice.completionRecord.markedCompleteBy,
      status: "completed",
    })),
  };
}

export function buildSnapshotProjectFromInvoice(invoice: Invoice): Project {
  const milestone = buildSnapshotMilestoneFromInvoice(invoice);

  return {
    id: invoice.projectId,
    projectCode: invoice.projectName,
    projectDate: invoice.invoiceDate,
    customerId: "",
    customerName: invoice.billToName,
    plannedStartDate: invoice.invoiceDate,
    plannedEndDate: invoice.dueDate,
    description: "",
    projectType: "",
    actualStartDate: "",
    actualEndDate: "",
    status: "in-progress",
    projectValue: invoice.subtotal,
    projectManager: invoice.completionRecord.markedCompleteBy,
    remarks: "",
    teamAssignments: [],
    milestones: [milestone],
    documents: [],
    budget: { materials: [], crew: [], equipment: [], overhead: [] },
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

export function resolveInvoiceEditContext(
  invoice: Invoice,
  getProjectById: (id: string) => Project | undefined
): { project: Project; milestone: ProjectMilestone } {
  const project = getProjectById(invoice.projectId);
  const milestone = project?.milestones.find((item) => item.id === invoice.milestoneId);

  if (project && milestone) {
    return { project, milestone };
  }

  if (project) {
    return { project, milestone: buildSnapshotMilestoneFromInvoice(invoice) };
  }

  const snapshotProject = buildSnapshotProjectFromInvoice(invoice);
  return { project: snapshotProject, milestone: snapshotProject.milestones[0] };
}

export interface ChartSlice {
  name: string;
  value: number;
  color: string;
}

export interface MonthlyInvoiceBarPoint {
  month: string;
  count: number;
  amount: number;
}

export interface PaymentMethodBarPoint {
  name: string;
  count: number;
  color: string;
}

const CHART_COLORS = {
  green: "#2E7D32",
  greenLight: "#66BB6A",
  greenPale: "#A5D6A7",
  blue: "#0284C7",
  orange: "#D97706",
  red: "#DC2626",
  purple: "#7C3AED",
  slate: "#64748B",
  grey: "#94A3B8",
} as const;

export function getPaymentsDonutData(invoices: Invoice[]): ChartSlice[] {
  const metrics = calculateInvoicingMetrics([], invoices);
  return [
    { name: "Collected", value: metrics.totalCollected, color: CHART_COLORS.green },
    { name: "Outstanding", value: metrics.totalOutstanding, color: CHART_COLORS.orange },
  ].filter((slice) => slice.value > 0);
}

export function getInvoiceStatusPieData(invoices: Invoice[]): ChartSlice[] {
  const statusColors: Record<InvoiceStatus, string> = {
    draft: CHART_COLORS.grey,
    sent: CHART_COLORS.blue,
    paid: CHART_COLORS.green,
  };

  const counts = new Map<InvoiceStatus, number>();
  for (const inv of invoices) {
    const status = resolveInvoiceStatus(inv);
    counts.set(status, (counts.get(status) ?? 0) + 1);
  }

  return Array.from(counts.entries()).map(([status, value]) => ({
    name: invoiceStatusLabel(status),
    value,
    color: statusColors[status],
  }));
}

export function getPaymentMethodsBarData(invoices: Invoice[]): PaymentMethodBarPoint[] {
  const methodColors: Record<string, string> = {
    ACH: CHART_COLORS.green,
    Check: CHART_COLORS.blue,
    "Credit Card": CHART_COLORS.purple,
    Zelle: CHART_COLORS.orange,
  };

  const counts = new Map<string, number>();
  for (const inv of invoices) {
    for (const method of inv.paymentMethods) {
      counts.set(method, (counts.get(method) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries()).map(([name, count]) => ({
    name,
    count,
    color: methodColors[name] ?? CHART_COLORS.slate,
  }));
}

export function getMonthlyInvoiceBarData(invoices: Invoice[]): MonthlyInvoiceBarPoint[] {
  const monthMap = new Map<string, { count: number; amount: number }>();

  for (const inv of invoices) {
    const monthKey = inv.invoiceDate.slice(0, 7);
    const entry = monthMap.get(monthKey) ?? { count: 0, amount: 0 };
    entry.count += 1;
    entry.amount += inv.totalDue;
    monthMap.set(monthKey, entry);
  }

  const sorted = Array.from(monthMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const recent = sorted.slice(-6);

  return recent.map(([key, data]) => {
    const [, monthNum] = key.split("-");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[parseInt(monthNum, 10) - 1] ?? key;
    return { month, count: data.count, amount: Math.round(data.amount) };
  });
}
