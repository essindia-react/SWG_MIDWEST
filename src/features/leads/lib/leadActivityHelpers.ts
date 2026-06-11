import { formatDate } from "../../../lib/formatters";
import {
  getLeadFullName,
  getLeadSourceLabel,
  getRepById,
} from "../../../lib/leadHelpers";
import {
  leadToWorkspaceForm,
  workspaceFormToLeadInput,
} from "../../../lib/leadWorkspaceHelpers";
import type {
  Lead,
  LeadFollowUpActivity,
  LeadFormInput,
} from "../../../types/lead";
import type { LucideIcon } from "lucide-react";
import {
  Calculator,
  Calendar,
  FileCheck,
  Mail,
  MapPin,
  MessageCircle,
  PenTool,
  Phone,
  UserPlus,
} from "lucide-react";

export type LeadActivityType =
  | "created"
  | "site-visit"
  | "design"
  | "estimation"
  | "proposal"
  | "call"
  | "email"
  | "note"
  | "scheduled";

export interface LeadActivityItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: LeadActivityType;
  icon: LucideIcon;
}

const ACTIVITY_ICON: Record<LeadActivityType, LucideIcon> = {
  created: UserPlus,
  "site-visit": MapPin,
  design: PenTool,
  estimation: Calculator,
  proposal: FileCheck,
  call: Phone,
  email: Mail,
  note: MessageCircle,
  scheduled: Calendar,
};

function activity(
  id: string,
  title: string,
  description: string,
  date: string,
  type: LeadActivityType,
): LeadActivityItem {
  return { id, title, description, date, type, icon: ACTIVITY_ICON[type] };
}

function getDefaultFollowUpActivities(lead: Lead): LeadFollowUpActivity[] {
  const wd = lead.workflowData ?? {};
  return [
    {
      id: "follow-up-call",
      title: "Called to discuss pricing",
      description:
        "Customer was happy with the design but asked for a 5% discount on the premium turf.",
      date: "2026-06-04",
    },
    {
      id: "follow-up-email",
      title: "Email sent with final proposal",
      description: wd.proposalId
        ? `Sent the ${wd.proposalId} document for electronic signature.`
        : "Sent the PRP-9902 document for electronic signature.",
      date: "2026-06-03",
      proposalRef: wd.proposalId ?? "PRP-9902",
    },
  ];
}

function followUpToActivityItem(entry: LeadFollowUpActivity): LeadActivityItem {
  const type: LeadActivityType = entry.title.toLowerCase().includes("email")
    ? "email"
    : entry.title.toLowerCase().includes("call")
      ? "call"
      : "note";

  return activity(entry.id, entry.title, entry.description, entry.date, type);
}

export function buildLeadInputWithFollowUp(
  lead: Lead,
  entry: LeadFollowUpActivity,
  nextFollowUpDate?: string,
): LeadFormInput {
  const existingActivities = lead.workflowData?.followUpActivities;
  const isUsingDefaults = !existingActivities?.length;
  const baseActivities = isUsingDefaults
    ? getDefaultFollowUpActivities(lead)
    : existingActivities;

  const input = workspaceFormToLeadInput(leadToWorkspaceForm(lead), lead);

  return {
    ...input,
    nextFollowUpDate: nextFollowUpDate || input.nextFollowUpDate,
    workflowData: {
      ...input.workflowData,
      followUpActivities: [...baseActivities, entry],
    },
  };
}

export function getLeadActivityTimeline(lead: Lead): LeadActivityItem[] {
  const wd = lead.workflowData ?? {};
  const rep = getRepById(lead.assignedRep);
  const customerName = getLeadFullName(lead);
  const items: LeadActivityItem[] = [];

  items.push(
    activity(
      "lead-created",
      "Lead Created",
      `${customerName} added to pipeline via ${getLeadSourceLabel(lead.leadSource)}. Assigned to ${rep.name}.`,
      lead.createdAt,
      "created",
    ),
  );

  if (wd.siteVisitScheduledDate || wd.visitDate) {
    items.push(
      activity(
        "site-visit",
        "Site Visit Scheduled",
        `Visit ${wd.visitStatus ? `marked as ${wd.visitStatus}` : "scheduled"}${wd.siteAddress ? ` at ${wd.siteAddress}` : ""}.`,
        wd.siteVisitScheduledDate ?? wd.visitDate ?? lead.updatedAt,
        "site-visit",
      ),
    );
  }

  if (wd.designId || wd.designName) {
    items.push(
      activity(
        "design",
        "Design Created",
        wd.designName
          ? `${wd.designName}${wd.designStatus ? ` — ${wd.designStatus}` : ""}`
          : `Design ${wd.designId} started${wd.designCreatedBy ? ` by ${wd.designCreatedBy}` : ""}.`,
        lead.updatedAt,
        "design",
      ),
    );
  }

  if (wd.estimationNo || (wd.estimationAreas?.length ?? 0) > 0) {
    items.push(
      activity(
        "estimation",
        "Estimation Prepared",
        wd.estimationNo
          ? `Estimation ${wd.estimationNo} prepared for ${wd.estimationCustomerName ?? customerName}.`
          : `Estimation with ${wd.estimationAreas?.length ?? 0} area(s) prepared.`,
        wd.estimationDate ?? lead.updatedAt,
        "estimation",
      ),
    );
  }

  if (wd.proposalId || wd.proposalName) {
    items.push(
      activity(
        "proposal",
        "Proposal Sent",
        wd.proposalName
          ? `${wd.proposalName}${wd.proposalStatus ? ` — ${wd.proposalStatus}` : ""}`
          : `Proposal ${wd.proposalId} shared with customer.`,
        lead.updatedAt,
        "proposal",
      ),
    );
  }

  const storedFollowUps = wd.followUpActivities?.length
    ? wd.followUpActivities
    : getDefaultFollowUpActivities(lead);

  for (const entry of storedFollowUps) {
    items.push(followUpToActivityItem(entry));
  }

  if (lead.nextFollowUpDate) {
    items.push(
      activity(
        "next-follow-up",
        "Follow-up Scheduled",
        `Next check-in with ${customerName}.`,
        lead.nextFollowUpDate,
        "scheduled",
      ),
    );
  }

  if (lead.internalNotes?.trim()) {
    items.push(
      activity(
        "internal-note",
        "Internal Note",
        lead.internalNotes.trim(),
        lead.updatedAt,
        "note",
      ),
    );
  }

  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function formatActivityDate(date: string): string {
  if (!date) return "—";
  if (/^[A-Za-z]{3}\s+\d{2},\s+\d{4}$/.test(date)) return date;
  return formatDate(date);
}
