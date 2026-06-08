import {
  MapPin,
  PenTool,
  Calculator,
  FileCheck,
  Paperclip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PipelineStage } from "../../../lib/leadHelpers";

export interface LeadWorkflowSection {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
  pipelineStages: PipelineStage[];
}

export const LEAD_WORKFLOW_SECTIONS: LeadWorkflowSection[] = [
  {
    id: "site-visit",
    label: "Site Visit",
    icon: MapPin,
    description: "Leads with scheduled or completed site visits.",
    pipelineStages: ["site_visit", "qualified"],
  },
  {
    id: "design",
    label: "Design",
    icon: PenTool,
    description: "Leads in the design and planning phase.",
    pipelineStages: ["qualified", "site_visit"],
  },
  {
    id: "estimation",
    label: "Estimation",
    icon: Calculator,
    description: "Leads with estimates in progress or sent.",
    pipelineStages: ["estimate_sent"],
  },
  {
    id: "proposal",
    label: "Proposal",
    icon: FileCheck,
    description: "Leads reviewing proposals and negotiating.",
    pipelineStages: ["negotiation", "estimate_sent"],
  },
  {
    id: "documents",
    label: "Documents",
    icon: Paperclip,
    description: "Closed leads with contracts and project documents.",
    pipelineStages: ["won", "lost"],
  },
];

export const DEFAULT_LEAD_WORKFLOW_STEP = LEAD_WORKFLOW_SECTIONS[0].id;

export function getLeadWorkflowSection(stepId: string | null | undefined) {
  return (
    LEAD_WORKFLOW_SECTIONS.find((section) => section.id === stepId) ??
    LEAD_WORKFLOW_SECTIONS[0]
  );
}
