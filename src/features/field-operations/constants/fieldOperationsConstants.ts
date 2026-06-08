import {
  Activity,
  ClipboardList,
  FileText,
  ListChecks,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { FieldDocumentType } from "../../../types/project";

export type FieldOperationsTabId =
  | "details"
  | "documents-guides"
  | "work-order"
  | "pick-list"
  | "activity-timeline";

export interface FieldOperationsTab {
  id: FieldOperationsTabId;
  label: string;
  icon: LucideIcon;
}

export const FIELD_DOCUMENT_TYPES: FieldDocumentType[] = [
  "Installation Guide",
  "Safety Guide",
  "HOA Rules",
  "Design Drawing",
  "Pre-Site Photo",
  "Other",
];

export const FIELD_ACTIVITY_STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
] as const;

export const FIELD_OPERATIONS_TABS: FieldOperationsTab[] = [
  { id: "details", label: "Project Details", icon: ClipboardList },
  { id: "documents-guides", label: "Documents & Guides", icon: FileText },
  { id: "work-order", label: "Work Order Management", icon: Wrench },
  { id: "pick-list", label: "Pick List Management", icon: ListChecks },
  { id: "activity-timeline", label: "Activity Timeline", icon: Activity },
];

export const FIELD_OPERATIONS_SIDEBAR = FIELD_OPERATIONS_TABS.map((tab) => ({
  type: "tab" as const,
  tab,
}));

export const CURRENT_USER_NAME = "Alex Johnson";
