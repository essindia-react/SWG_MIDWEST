import { format, parseISO } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  CheckCircle2,
  Flag,
  FolderOpen,
  PlusCircle,
  Users,
} from "lucide-react";
import { getEmptyProjectBudget } from "./budgetHelpers";
import type { Project, ProjectDocument, ProjectStatus } from "../types/project";

export function filterProjectsWithMilestones(projects: Project[]): Project[] {
  return projects.filter((project) => project.milestones.length > 0);
}

export interface ProjectTableRow {
  id: string;
  projectCode: string;
  projectDate: string;
  customerName: string;
  projectType: string;
  status: string;
  statusColor: string;
  statusBg: string;
  projectManager: string;
  projectValue: string;
  plannedStartDate: string;
  plannedEndDate: string;
  createdAt: string;
  isUserAdded: boolean;
}

const STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  planning: { label: "Planning", color: "#0284C7", bg: "#EFF6FF" },
  "in-progress": { label: "In Progress", color: "#2E7D32", bg: "#E8F5E9" },
  "on-hold": { label: "On Hold", color: "#D97706", bg: "#FFF7ED" },
  completed: { label: "Completed", color: "#64748B", bg: "#F1F5F9" },
  cancelled: { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2" },
};

export function getProjectStatusLabel(status: ProjectStatus): string {
  return STATUS_CONFIG[status]?.label ?? status;
}

export function getProjectStatusConfig(status: ProjectStatus) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.planning;
}

export function formatProjectDate(isoDate: string): string {
  if (!isoDate) return "—";
  try {
    return format(parseISO(isoDate), "MM/dd/yyyy");
  } catch {
    return isoDate;
  }
}

export function generateProjectCode(): string {
  const year = new Date().getFullYear();
  const suffix = String(Math.floor(Math.random() * 900) + 100);
  return `SWG-PROJ-${year}-${suffix}`;
}

export function getDefaultProjectDocuments(): ProjectDocument[] {
  return [
    { id: "doc-1", category: "Pre Site Images and Post", label: "Before Site Photo" },
    { id: "doc-2", category: "Pre Site Images and Post", label: "After Site Photo" },
    { id: "doc-3", category: "Proof of work", label: "Completion Certificate" },
    { id: "doc-4", category: "Proof of work", label: "Sign-off Document" },
  ];
}

export function normalizeProject(project: Project): Project {
  return {
    ...project,
    documents: project.documents?.length ? project.documents : getDefaultProjectDocuments(),
    budget: project.budget ?? getEmptyProjectBudget(),
    fieldOperations: project.fieldOperations,
  };
}

export interface ProjectTimelineItem {
  id: string;
  title: string;
  body: string;
  time: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export function buildProjectTimeline(project: Project): ProjectTimelineItem[] {
  const items: ProjectTimelineItem[] = [
    {
      id: "created",
      title: "Project Created",
      body: `${project.projectCode} started for ${project.customerName}. Type: ${project.projectType}.`,
      time: formatProjectDate(project.projectDate),
      icon: PlusCircle,
      iconBg: "#F0FDF4",
      iconColor: "#2E7D32",
    },
  ];

  if (project.actualStartDate) {
    items.unshift({
      id: "actual-start",
      title: "Work Started",
      body: `Actual start on site. Managed by ${project.projectManager || "team"}.`,
      time: formatProjectDate(project.actualStartDate),
      icon: Flag,
      iconBg: "#EFF6FF",
      iconColor: "#0284C7",
    });
  }

  project.teamAssignments.forEach((member) => {
    items.unshift({
      id: `team-${member.id}`,
      title: "Team Member Assigned",
      body: `${member.userName} joined as ${member.role}.`,
      time: formatProjectDate(member.startDate),
      icon: Users,
      iconBg: "#F5F3FF",
      iconColor: "#7C3AED",
    });
  });

  project.milestones.forEach((milestone) => {
    items.unshift({
      id: `ms-${milestone.id}`,
      title: `Milestone: ${milestone.name}`,
      body: `${milestoneLabel(milestone.status)} — ${milestone.tasks.length} task(s). ${milestone.description || ""}`.trim(),
      time: formatProjectDate(milestone.plannedStartDate),
      icon: Flag,
      iconBg: milestone.status === "completed" ? "#F0FDF4" : "#FFF7ED",
      iconColor: milestone.status === "completed" ? "#2E7D32" : "#D97706",
    });

    milestone.tasks.forEach((task) => {
      items.unshift({
        id: `task-${task.id}`,
        title: `Task: ${task.name}`,
        body: `${taskLabel(task.status)}${task.assignedTo ? ` — ${task.assignedTo}` : ""}`,
        time: formatProjectDate(task.plannedStartDate),
        icon: CheckCircle2,
        iconBg: "#F8FAFC",
        iconColor: "#64748B",
      });
    });
  });

  if (project.documents.length > 0) {
    items.unshift({
      id: "documents",
      title: "Documents Attached",
      body: `${project.documents.length} file slot(s) across project documentation.`,
      time: formatProjectDate(project.updatedAt.slice(0, 10)),
      icon: FolderOpen,
      iconBg: "#EFF6FF",
      iconColor: "#0284C7",
    });
  }

  if (project.actualEndDate) {
    items.unshift({
      id: "actual-end",
      title: "Project Completed",
      body: project.remarks || "Project marked complete.",
      time: formatProjectDate(project.actualEndDate),
      icon: CheckCircle2,
      iconBg: "#F0FDF4",
      iconColor: "#2E7D32",
    });
  }

  return items;
}

function milestoneLabel(status: string) {
  const map: Record<string, string> = {
    completed: "Completed",
    "in-progress": "In Progress",
    "on-hold": "On Hold",
  };
  return map[status] ?? status;
}

function taskLabel(status: string) {
  const map: Record<string, string> = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    completed: "Completed",
    "on-hold": "On Hold",
  };
  return map[status] ?? status;
}

export function projectToTableRow(
  project: Project,
  isUserAdded = false
): ProjectTableRow {
  const statusConfig = getProjectStatusConfig(project.status);
  return {
    id: project.id,
    projectCode: project.projectCode,
    projectDate: formatProjectDate(project.projectDate),
    customerName: project.customerName,
    projectType: project.projectType,
    status: statusConfig.label,
    statusColor: statusConfig.color,
    statusBg: statusConfig.bg,
    projectManager: project.projectManager || "—",
    projectValue: project.projectValue
      ? new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          maximumFractionDigits: 0,
        }).format(project.projectValue)
      : "—",
    plannedStartDate: formatProjectDate(project.plannedStartDate),
    plannedEndDate: formatProjectDate(project.plannedEndDate),
    createdAt: project.createdAt,
    isUserAdded,
  };
}
