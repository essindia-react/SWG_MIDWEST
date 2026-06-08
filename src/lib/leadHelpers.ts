import { DUMMY_LEADS } from "../data/dummyLeads";
import type { BudgetRange, Lead, LeadStatus, ProjectType } from "../types/lead";
import {
  LEAD_SOURCES,
  LEAD_STATUS_CONFIG,
  OHIO_REGIONS,
  PROJECT_TYPES,
  SALES_REPS,
} from "./constants";
import { formatDate, formatRelativeTime } from "./formatters";

const DUMMY_LEAD_IDS = new Set(DUMMY_LEADS.map((lead) => lead.id));

const BUDGET_MIDPOINTS: Record<BudgetRange, number> = {
  "under-10k": 7500,
  "10k-25k": 17500,
  "25k-50k": 37500,
  "50k-100k": 75000,
  "over-100k": 125000,
};

const SQFT_RATE_BY_TYPE: Record<ProjectType, number> = {
  "putting-green": 28,
  "artificial-turf": 12,
  "pet-turf": 14,
  playground: 16,
  "sports-turf": 18,
  "tee-line": 22,
  hardscape: 20,
  landscaping: 10,
  maintenance: 5,
  other: 12,
};

export function estimateLeadValue(
  projectType: ProjectType,
  squareFootageEstimate?: number,
  budgetRange?: BudgetRange
): number {
  if (budgetRange) {
    return BUDGET_MIDPOINTS[budgetRange];
  }
  if (squareFootageEstimate && squareFootageEstimate > 0) {
    return Math.round(squareFootageEstimate * SQFT_RATE_BY_TYPE[projectType]);
  }
  return 0;
}

export function getLeadFullName(lead: Lead): string {
  return `${lead.firstName} ${lead.lastName}`.trim();
}

export function getLeadDisplayAddress(lead: Lead): string {
  const parts = [lead.address, lead.city, lead.state, lead.zipCode].filter(Boolean);
  return parts.join(", ");
}

export function getRepById(repId: string) {
  return SALES_REPS.find((rep) => rep.id === repId) ?? SALES_REPS[0];
}

export function getProjectTypeLabel(value: ProjectType): string {
  return PROJECT_TYPES.find((type) => type.value === value)?.label ?? value;
}

export function getLeadSourceLabel(source: Lead["leadSource"]): string {
  return LEAD_SOURCES.find((item) => item.value === source)?.label ?? source;
}

export function getOhioRegionLabel(region: Lead["ohioRegion"]): string {
  return OHIO_REGIONS.find((item) => item.value === region)?.label ?? region;
}

export function isStaleNewLead(lead: Lead): boolean {
  if (lead.status !== "new") return false;
  const created = new Date(lead.createdAt).getTime();
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  return created < sevenDaysAgo;
}

export function derivePriority(
  estimatedValue: number
): "high" | "medium" | "low" {
  if (estimatedValue >= 50000) return "high";
  if (estimatedValue >= 20000) return "medium";
  return "low";
}

export function leadToTags(lead: Lead): string[] {
  const tags: string[] = [];
  if (lead.propertyType) {
    tags.push(
      lead.propertyType.charAt(0).toUpperCase() + lead.propertyType.slice(1)
    );
  } else if (lead.projectSubtype) {
    tags.push(
      lead.projectSubtype.charAt(0).toUpperCase() + lead.projectSubtype.slice(1)
    );
  }
  tags.push(getProjectTypeLabel(lead.projectType).split("/")[0].trim());
  if (lead.status === "won") tags.push("Won");
  return tags;
}

export type PipelineStage =
  | "new"
  | "contacted"
  | "qualified"
  | "site_visit"
  | "estimate_sent"
  | "negotiation"
  | "won"
  | "lost";

const STATUS_TO_PIPELINE: Record<LeadStatus, PipelineStage> = {
  new: "new",
  contacted: "contacted",
  consulted: "qualified",
  quoted: "estimate_sent",
  won: "won",
  lost: "lost",
  nurturing: "contacted",
};

const PIPELINE_TO_STATUS: Record<PipelineStage, LeadStatus> = {
  new: "new",
  contacted: "contacted",
  qualified: "consulted",
  site_visit: "consulted",
  estimate_sent: "quoted",
  negotiation: "quoted",
  won: "won",
  lost: "lost",
};

export function leadStatusToPipelineStage(status: LeadStatus): PipelineStage {
  return STATUS_TO_PIPELINE[status];
}

export function pipelineStageToLeadStatus(stage: PipelineStage): LeadStatus {
  return PIPELINE_TO_STATUS[stage];
}

export interface LeadTableRow {
  id: string;
  leadNumber: string;
  leadDate: string;
  customerName: string;
  contactPerson: string;
  status: string;
  statusColor: string;
  statusBg: string;
  createdBy: string;
  createdByInitials: string;
  createdByColor: string;
  leadSource: string;
  leadType: string;
  city: string;
  createdAt: string;
  isStale: boolean;
  isUserAdded: boolean;
}

export function getLeadCustomerName(lead: Lead): string {
  return lead.company?.trim() || getLeadFullName(lead);
}

export function leadToTableRow(lead: Lead): LeadTableRow {
  const rep = getRepById(lead.assignedRep);
  const statusConfig = LEAD_STATUS_CONFIG[lead.status];

  return {
    id: lead.id,
    leadNumber: lead.leadNumber,
    leadDate: formatDate(lead.createdAt),
    customerName: getLeadCustomerName(lead),
    contactPerson: getLeadFullName(lead),
    status: statusConfig.label,
    statusColor: statusConfig.color,
    statusBg: statusConfig.bg,
    createdBy: rep.name,
    createdByInitials: rep.initials,
    createdByColor: rep.color,
    leadSource: getLeadSourceLabel(lead.leadSource),
    leadType: getProjectTypeLabel(lead.projectType),
    city: lead.city || "—",
    createdAt: lead.createdAt,
    isStale: isStaleNewLead(lead),
    isUserAdded: !DUMMY_LEAD_IDS.has(lead.id),
  };
}

export function isLeadCreatedToday(lead: Lead): boolean {
  const created = new Date(lead.createdAt);
  const today = new Date();
  return created.toDateString() === today.toDateString();
}

export function getNewLeadsToday(leads: Lead[]): Lead[] {
  return leads.filter(isLeadCreatedToday);
}

export function getRecentNewLeads(leads: Lead[], limit = 5): Lead[] {
  return [...leads]
    .filter((lead) => lead.status === "new")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export function getTotalPipelineValue(leads: Lead[]): number {
  return leads.reduce((sum, lead) => sum + lead.estimatedValue, 0);
}

export interface PipelineLeadCard {
  id: string;
  name: string;
  address: string;
  value: number;
  source: string;
  rep: string;
  repInitials: string;
  lastActivity: string;
  priority: Lead["priority"];
  stage: PipelineStage;
  phone: string;
  email: string;
  tags: string[];
  daysInStage: number;
}

export function leadToPipelineCard(lead: Lead): PipelineLeadCard {
  const rep = getRepById(lead.assignedRep);
  const updated = new Date(lead.updatedAt).getTime();
  const daysInStage = Math.max(
    0,
    Math.floor((Date.now() - updated) / (24 * 60 * 60 * 1000))
  );

  return {
    id: lead.id,
    name: getLeadFullName(lead),
    address: getLeadDisplayAddress(lead),
    value: lead.estimatedValue,
    source: getLeadSourceLabel(lead.leadSource),
    rep: rep.name,
    repInitials: rep.initials,
    lastActivity: formatRelativeTime(lead.updatedAt),
    priority: lead.priority,
    stage: leadStatusToPipelineStage(lead.status),
    phone: lead.phone,
    email: lead.email,
    tags: leadToTags(lead),
    daysInStage,
  };
}
