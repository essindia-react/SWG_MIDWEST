import type { Lead, LeadPriority, PropertyType } from "../types/lead";
import { normalizeLeadStatus } from "./constants";

export function generateLeadNumber(): string {
  return `LD-${Date.now().toString().slice(-4)}`;
}

export const LEAD_FIELD_DEFAULTS: Pick<
  Lead,
  | "state"
  | "propertyType"
  | "priority"
  | "drainageRequired"
  | "removeExistingGrass"
  | "hoaApprovalRequired"
  | "leadSource"
  | "status"
> = {
  state: "OH",
  propertyType: "residential",
  priority: "medium",
  drainageRequired: false,
  removeExistingGrass: false,
  hoaApprovalRequired: false,
  leadSource: "web-form",
  status: "new",
};

export function applyLeadDefaults(lead: Lead): Lead {
  return {
    ...LEAD_FIELD_DEFAULTS,
    leadNumber: lead.leadNumber ?? `LD-${lead.id.replace(/\D/g, "").slice(-4) || "0000"}`,
    ...lead,
    drainageRequired: lead.drainageRequired ?? false,
    removeExistingGrass: lead.removeExistingGrass ?? false,
    hoaApprovalRequired: lead.hoaApprovalRequired ?? false,
    priority: (lead.priority ?? "medium") as LeadPriority,
    propertyType: (lead.propertyType ?? "residential") as PropertyType,
    state: lead.state ?? "OH",
    status: normalizeLeadStatus(lead.status),
  };
}
