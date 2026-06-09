import { CheckSquare, ListChecks, Package, type LucideIcon } from "lucide-react";

export type TaskManagementPanelTabId = "tasks" | "pick-list" | "material-request";

export interface TaskManagementPanelTab {
  id: TaskManagementPanelTabId;
  label: string;
  icon: LucideIcon;
}

export const TASK_MANAGEMENT_PANEL_TABS: TaskManagementPanelTab[] = [
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "pick-list", label: "Pick List", icon: ListChecks },
  { id: "material-request", label: "Material Request", icon: Package },
];

export const TASK_PICK_LIST_UNITS = ["sq ft", "roll", "bag", "unit", "linear ft"] as const;
