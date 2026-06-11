import {
  ClipboardList,
  Flag,
  FolderOpen,
  HardHat,
  LayoutDashboard,
  Package,
  Receipt,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type ProjectWorkspaceTabId =
  | "details"
  | "edit"
  | "teams"
  | "milestones"
  | "documents"
  | "budget-materials"
  | "budget-crew"
  | "budget-equipment"
  | "budget-overhead"
  | "budget-summary";

export interface ProjectWorkspaceTab {
  id: ProjectWorkspaceTabId;
  label: string;
  icon: LucideIcon;
}

export type ProjectWorkspaceSidebarItem =
  | { type: "tab"; tab: ProjectWorkspaceTab }
  | { type: "heading"; label: string };

export const PROJECT_WORKSPACE_TABS: ProjectWorkspaceTab[] = [
  { id: "details", label: "Project Details", icon: ClipboardList },
  { id: "teams", label: "Assign Teams", icon: Users },
  { id: "milestones", label: "Milestones", icon: Flag },
  { id: "documents", label: "Doc/Attachments", icon: FolderOpen },
  { id: "budget-materials", label: "Materials Cost Planning", icon: Package },
  { id: "budget-crew", label: "Crew Cost Planning", icon: HardHat },
  { id: "budget-equipment", label: "Equipment Cost Planning", icon: Truck },
  { id: "budget-overhead", label: "Overhead Expenses", icon: Receipt },
  { id: "budget-summary", label: "Budget Summary", icon: LayoutDashboard },
];

export const PROJECT_WORKSPACE_SIDEBAR: ProjectWorkspaceSidebarItem[] = [
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[0] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[1] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[2] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[3] },
  { type: "heading", label: "Budgeting" },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[4] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[5] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[6] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[7] },
  { type: "tab", tab: PROJECT_WORKSPACE_TABS[8] },
];

export const PROJECT_CUSTOMERS = [
  {
    id: "cust-1024",
    name: "Henderson Estate",
    code: "SWG-CUST-1024",
    email: "rob.henderson@gmail.com",
    phone: "(614) 555-0187",
    address: "5500 McCormick Ranch Dr, Dublin, OH 43017",
  },
  {
    id: "cust-1156",
    name: "Park Estates Dev.",
    code: "SWG-CUST-1156",
    email: "dev@parkestates.com",
    phone: "(513) 555-0601",
    address: "2100 Park Blvd, Mason, OH 45040",
  },
  {
    id: "cust-1188",
    name: "Rivera Pool & Turf",
    code: "SWG-CUST-1188",
    email: "tony@riverapool.com",
    phone: "(614) 555-0334",
    address: "7834 W Camelback Rd, Columbus, OH 43220",
  },
  {
    id: "cust-1201",
    name: "Sunbelt Properties",
    code: "SWG-CUST-1201",
    email: "pm@sunbeltprop.com",
    phone: "(937) 555-0728",
    address: "4400 S Power Rd, Dayton, OH 45429",
  },
] as const;

export const PROJECT_PROPOSALS = [
  {
    id: "PRP-9902",
    name: "Final Proposal — Henderson Estate Pet Turf",
    customerId: "cust-1024",
    status: "Sent",
  },
  {
    id: "PRP-9841",
    name: "Park Estates Amenity Center Putting Green",
    customerId: "cust-1156",
    status: "Sent",
  },
  {
    id: "PRP-9755",
    name: "Rivera Showroom Hardscape Refresh",
    customerId: "cust-1188",
    status: "Draft",
  },
  {
    id: "PRP-9680",
    name: "Sunbelt Properties Sports Practice Field",
    customerId: "cust-1201",
    status: "Accepted",
  },
] as const;

export function getProposalsForCustomer(customerId: string) {
  return PROJECT_PROPOSALS.filter((p) => p.customerId === customerId);
}

export const PROJECT_TYPE_OPTIONS = [
  "General Landscaping",
  "Artificial Turf Installation",
  "Golf / Putting Green",
  "Pet & Dog Turf",
  "Hardscaping / Paving",
  "Playground Turf",
  "Sports Turf",
  "Maintenance Contract",
  "Other",
] as const;

export const PROJECT_STATUS_OPTIONS = [
  "Planning",
  "In Progress",
  "On Hold",
  "Completed",
  "Cancelled",
] as const;

export const MILESTONE_STATUS_OPTIONS = ["Completed", "In Progress", "On Hold"] as const;

export const TASK_STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "On Hold",
] as const;

export const TEAM_ROLES = [
  "Project Manager",
  "Site Supervisor",
  "Lead Installer",
  "Installer",
  "Estimator",
  "Designer",
] as const;

export const TEAM_USERS = [
  { id: "maria-s", name: "Maria S." },
  { id: "emily-c", name: "Emily C." },
  { id: "chris-w", name: "Chris W." },
  { id: "alex-j", name: "Alex J." },
  { id: "carlos-r", name: "Carlos R." },
] as const;

/** Shared site supervisor across demo projects — field crew app uses this identity. */
export const FIELD_SITE_SUPERVISOR = TEAM_USERS.find((user) => user.id === "alex-j")!;

export const SECTION_PLACEHOLDERS = {
  project: "Yet not decided",
  projectManager: "Project manager yet not decided",
  description: "Project description yet not decided",
  remarks: "Remarks yet not decided",
  team: "No members assigned yet",
  milestones: "Milestones yet not decided",
  tasks: "Tasks for this milestone yet not decided",
  attachments: "No documents attached yet",
  budget: "Budget not planned yet",
} as const;

/** @deprecated Use SECTION_PLACEHOLDERS */
export const NOT_DECIDED = SECTION_PLACEHOLDERS.project;

export function getCustomerById(id: string) {
  return PROJECT_CUSTOMERS.find((c) => c.id === id);
}

export function displayValue(
  value: string | number | undefined | null,
  formatter?: (v: string) => string,
  placeholder: string = SECTION_PLACEHOLDERS.project
): string {
  if (value === undefined || value === null || value === "") {
    return placeholder;
  }
  if (typeof value === "number" && value === 0) {
    return placeholder;
  }
  return formatter ? formatter(String(value)) : String(value);
}

export function isPlaceholderValue(
  value: string,
  placeholder: string = SECTION_PLACEHOLDERS.project
): boolean {
  return value === placeholder;
}

export function projectStatusToApi(label: string) {
  const map: Record<string, string> = {
    Planning: "planning",
    "In Progress": "in-progress",
    "On Hold": "on-hold",
    Completed: "completed",
    Cancelled: "cancelled",
  };
  return map[label] ?? "planning";
}

export function projectStatusFromApi(status: string) {
  const map: Record<string, string> = {
    planning: "Planning",
    "in-progress": "In Progress",
    "on-hold": "On Hold",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return map[status] ?? "Planning";
}

export function milestoneStatusToApi(label: string) {
  const map: Record<string, string> = {
    Completed: "completed",
    "In Progress": "in-progress",
    "On Hold": "on-hold",
  };
  return map[label] ?? "in-progress";
}

export function milestoneStatusFromApi(status: string) {
  const map: Record<string, string> = {
    completed: "Completed",
    "in-progress": "In Progress",
    "on-hold": "On Hold",
  };
  return map[status] ?? "In Progress";
}

export function taskStatusToApi(label: string) {
  const map: Record<string, string> = {
    "Not Started": "not-started",
    "In Progress": "in-progress",
    Completed: "completed",
    "On Hold": "on-hold",
  };
  return map[label] ?? "not-started";
}

export function taskStatusFromApi(status: string) {
  const map: Record<string, string> = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    completed: "Completed",
    "on-hold": "On Hold",
  };
  return map[status] ?? "Not Started";
}
