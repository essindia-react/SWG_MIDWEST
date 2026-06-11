import {
  DEFAULT_NOTES_TO_CLIENT,
  DEFAULT_TAX_PERCENT,
} from "../features/invoicing/constants/invoicingConstants";
import { getCustomerById } from "../features/projects/constants/projectConstants";
import {
  buildLineItems,
  calculateDueDate,
  getAmountPreviouslyPaid,
} from "../lib/invoiceHelpers";
import type { Invoice, InvoiceStatus } from "../types/invoice";
import type { Project, ProjectMilestone } from "../types/project";
import { DUMMY_PROJECTS } from "./dummyProjects";

const defaultChecklist = {
  "Site Preparation Complete": true,
  "Installation Quality Verified": true,
  "Safety Inspection Passed": true,
  "Manager Sign-off": true,
};

function getProjectContext(
  projectId: string,
  milestoneId: string,
): { project: Project; milestone: ProjectMilestone } | null {
  const project = DUMMY_PROJECTS.find((item) => item.id === projectId);
  const milestone = project?.milestones.find((item) => item.id === milestoneId);
  if (!project || !milestone) return null;
  return { project, milestone };
}

function buildSeedInvoice(
  config: {
    id: string;
    invoiceNumber: string;
    projectId: string;
    milestoneId: string;
    status: InvoiceStatus;
    invoiceDate: string;
    paymentTerms: Invoice["paymentTerms"];
    paymentMethods: Invoice["paymentMethods"];
    notesToClient: string;
    internalNotes: string;
    completionPct: number;
    completionDate: string;
    completionPhotos: string[];
    createdAt: string;
    updatedAt: string;
    balanceRemaining?: number;
  },
  priorInvoices: Invoice[],
): Invoice | null {
  const context = getProjectContext(config.projectId, config.milestoneId);
  if (!context) return null;

  const { project, milestone } = context;
  const customer = getCustomerById(project.customerId);
  const lineItems = buildLineItems(project, milestone);
  const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
  const taxAmount = Math.round(subtotal * (DEFAULT_TAX_PERCENT / 100) * 100) / 100;
  const totalDue = Math.round((subtotal + taxAmount) * 100) / 100;
  const amountPreviouslyPaid = getAmountPreviouslyPaid(
    project.id,
    milestone.id,
    priorInvoices,
  );
  const balanceRemaining =
    config.balanceRemaining ??
    Math.max(0, Math.round((totalDue - amountPreviouslyPaid) * 100) / 100);

  return {
    id: config.id,
    invoiceNumber: config.invoiceNumber,
    projectId: project.id,
    milestoneId: milestone.id,
    status: config.status,
    invoiceDate: config.invoiceDate,
    dueDate: calculateDueDate(config.invoiceDate, config.paymentTerms),
    billToName: project.customerName,
    billToAddress: customer?.address ?? "",
    billToEmail: customer?.email ?? "",
    projectName: project.projectCode,
    jobSiteAddress: customer?.address ?? "",
    milestoneName: milestone.name,
    lineItems,
    subtotal,
    taxPercent: DEFAULT_TAX_PERCENT,
    taxAmount,
    totalDue,
    amountPreviouslyPaid,
    balanceRemaining,
    paymentTerms: config.paymentTerms,
    paymentMethods: config.paymentMethods,
    notesToClient: config.notesToClient,
    internalNotes: config.internalNotes,
    completionRecord: {
      completionPct: config.completionPct,
      markedCompleteBy: milestone.assignedTo,
      completionDate: config.completionDate,
      completionPhotos: config.completionPhotos,
      checklistSignedOff: defaultChecklist,
    },
    createdAt: config.createdAt,
    updatedAt: config.updatedAt,
  };
}

function buildDummyInvoices(): Invoice[] {
  const seeds: Invoice[] = [];

  const inv1 = buildSeedInvoice(
    {
      id: "inv-dummy-1",
      invoiceNumber: "SWG-INV-2026-0001",
      projectId: "project-1",
      milestoneId: "p1-ms-1",
      status: "paid",
      invoiceDate: "2026-06-14",
      paymentTerms: "Net 15",
      paymentMethods: ["ACH", "Check"],
      notesToClient:
        "Site preparation milestone complete — sod removal and base prep finished.",
      internalNotes: "Henderson Estate p1-task-1 completed by Chris W.",
      completionPct: 100,
      completionDate: "2026-06-14",
      completionPhotos: ["henderson-prep-before.jpg", "henderson-prep-after.jpg"],
      createdAt: "2026-06-14T10:00:00.000Z",
      updatedAt: "2026-06-20T14:00:00.000Z",
      balanceRemaining: 0,
    },
    seeds,
  );
  if (inv1) seeds.push(inv1);

  const inv2 = buildSeedInvoice(
    {
      id: "inv-dummy-2",
      invoiceNumber: "SWG-INV-2026-0002",
      projectId: "project-1",
      milestoneId: "p1-ms-2",
      status: "sent",
      invoiceDate: "2026-06-20",
      paymentTerms: "Net 15",
      paymentMethods: ["ACH", "Credit Card"],
      notesToClient:
        "Turf installation in progress — compact base and turf roll-out underway.",
      internalNotes: "p1-task-2 in progress; p1-task-3 not started.",
      completionPct: 33,
      completionDate: "2026-06-20",
      completionPhotos: ["henderson-turf-progress.jpg"],
      createdAt: "2026-06-20T09:30:00.000Z",
      updatedAt: "2026-06-20T09:30:00.000Z",
    },
    seeds,
  );
  if (inv2) seeds.push(inv2);

  const inv3 = buildSeedInvoice(
    {
      id: "inv-dummy-3",
      invoiceNumber: "SWG-INV-2026-0003",
      projectId: "project-2",
      milestoneId: "p2-ms-1",
      status: "paid",
      invoiceDate: "2026-06-13",
      paymentTerms: "Net 15",
      paymentMethods: ["ACH", "Check"],
      notesToClient: "Field grading and perimeter drainage milestone complete.",
      internalNotes: "Sunbelt p2-task-1 and p2-task-2 completed.",
      completionPct: 100,
      completionDate: "2026-06-12",
      completionPhotos: ["sunbelt-drainage-complete.jpg"],
      createdAt: "2026-06-13T11:00:00.000Z",
      updatedAt: "2026-06-18T16:00:00.000Z",
      balanceRemaining: 0,
    },
    seeds,
  );
  if (inv3) seeds.push(inv3);

  const inv4 = buildSeedInvoice(
    {
      id: "inv-dummy-4",
      invoiceNumber: "SWG-INV-2026-0004",
      projectId: "project-2",
      milestoneId: "p2-ms-2",
      status: "draft",
      invoiceDate: "2026-06-28",
      paymentTerms: "Net 15",
      paymentMethods: ["ACH", "Check", "Zelle"],
      notesToClient: DEFAULT_NOTES_TO_CLIENT,
      internalNotes: "Hold until p2-task-5 grooming task is complete.",
      completionPct: 67,
      completionDate: "2026-06-27",
      completionPhotos: ["sunbelt-turf-laydown.jpg"],
      createdAt: "2026-06-28T10:00:00.000Z",
      updatedAt: "2026-06-28T10:00:00.000Z",
    },
    seeds,
  );
  if (inv4) seeds.push(inv4);

  const inv5 = buildSeedInvoice(
    {
      id: "inv-dummy-5",
      invoiceNumber: "SWG-INV-2026-0005",
      projectId: "project-2",
      milestoneId: "p2-ms-2",
      status: "sent",
      invoiceDate: "2026-06-19",
      paymentTerms: "Net 15",
      paymentMethods: ["ACH"],
      notesToClient: "Progress invoice — shock pad underlayment complete.",
      internalNotes: "p2-task-3 completed; sports turf roll-out in progress.",
      completionPct: 33,
      completionDate: "2026-06-18",
      completionPhotos: ["sunbelt-shock-pad-complete.jpg"],
      createdAt: "2026-06-19T08:00:00.000Z",
      updatedAt: "2026-06-19T08:00:00.000Z",
    },
    seeds,
  );
  if (inv5) seeds.push(inv5);

  return seeds;
}

export const DUMMY_INVOICES: Invoice[] = buildDummyInvoices();
