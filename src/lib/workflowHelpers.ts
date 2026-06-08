import {
  getLeadFullName,
  getRepById,
} from "./leadHelpers";
import { formatShortDate } from "./dateHelpers";
import type { Lead } from "../types/lead";

export interface WorkflowStepDetails {
  lines: string[];
}

function getLatestWorkflowLead(leads: Lead[]): Lead | null {
  const withWorkflow = leads
    .filter((lead) => lead.workflowData)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return withWorkflow[0] ?? null;
}

export function getWorkflowStepDetails(
  stepId: string,
  leads: Lead[]
): WorkflowStepDetails {
  const lead = getLatestWorkflowLead(leads);

  if (!lead?.workflowData) {
    return { lines: ["Create a lead to see details"] };
  }

  const wd = lead.workflowData;
  const customer = getLeadFullName(lead);
  const rep = wd.assignedSalesRepName ?? getRepById(lead.assignedRep).name;

  switch (stepId) {
    case "site-visit": {
      const visitDate = wd.visitDate || wd.siteVisitScheduledDate;
      const lines = [customer];
      const statusLine = [
        wd.visitStatus ?? "Scheduled",
        visitDate ? formatShortDate(visitDate) : null,
        wd.visitTime || null,
      ]
        .filter(Boolean)
        .join(" · ");
      if (statusLine) lines.push(statusLine);
      lines.push(wd.surveyedBy ? `Assigned: ${wd.surveyedBy}` : `Rep: ${rep}`);
      return { lines };
    }
    case "design": {
      const lines = [customer];
      if (wd.designName) lines.push(wd.designName);
      lines.push(`${wd.designStatus ?? "Draft"} · ${wd.designId ?? "—"}`);
      lines.push(`By: ${wd.designCreatedBy ?? rep}`);
      return { lines };
    }
    case "estimation": {
      const lines = [wd.estimationCustomerName || customer];
      lines.push(`${wd.estimationNo ?? "—"} · ${wd.estimationDate ? formatShortDate(wd.estimationDate) : "Pending"}`);
      if (wd.areaName) lines.push(`Area: ${wd.areaName}`);
      return { lines };
    }
    case "proposal": {
      const lines = [wd.proposalName || `Proposal - ${customer}`];
      lines.push(`${wd.proposalStatus ?? "Draft"} · ${wd.proposalId ?? "—"}`);
      lines.push(`Customer: ${wd.estimationCustomerName || customer}`);
      return { lines };
    }
    case "documents": {
      const lines = [customer];
      lines.push(`${wd.documentCount ?? 0} document(s) uploaded`);
      lines.push(`Lead #${lead.leadNumber}`);
      return { lines };
    }
    default:
      return { lines: [customer] };
  }
}

/** @deprecated Use getWorkflowStepDetails */
export function getWorkflowStepSummary(stepId: string, leads: Lead[]): string {
  return getWorkflowStepDetails(stepId, leads).lines.join(" · ");
}
