import React, { useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Flag,
  FolderKanban,
  Search,
} from "lucide-react";
import { useProjects } from "../../../hooks/useProjects";
import { formatProjectDate, getProjectStatusConfig } from "../../../lib/projectHelpers";
import {
  milestoneStatusFromApi,
  projectStatusFromApi,
} from "../../projects/constants/projectConstants";
import type { Project, ProjectMilestone } from "../../../types/project";

interface TaskManagementProjectsListProps {
  onSelectMilestone: (projectId: string, milestoneId: string) => void;
}

function MilestoneRow({
  milestone,
  projectId,
  onSelect,
}: {
  milestone: ProjectMilestone;
  projectId: string;
  onSelect: (projectId: string, milestoneId: string) => void;
}) {
  const msStatus = getProjectStatusConfig(
    milestone.status as "completed" | "in-progress" | "on-hold"
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(projectId, milestone.id)}
      className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-3 text-left border-0 cursor-pointer transition-colors hover:bg-green-50/60"
      style={{ backgroundColor: "transparent" }}
    >
      <Flag className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
      <div className="flex-1 min-w-0">
        <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
          {milestone.name}
        </p>
        <p
          className="truncate hidden sm:block"
          style={{ fontSize: "11px", color: "var(--muted-foreground)" }}
        >
          {milestone.assignedTo || "Unassigned"} · {milestone.tasks.length} task
          {milestone.tasks.length !== 1 ? "s" : ""} ·{" "}
          {formatProjectDate(milestone.plannedStartDate)}
          {milestone.plannedEndDate ? ` – ${formatProjectDate(milestone.plannedEndDate)}` : ""}
        </p>
        <p className="sm:hidden truncate" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
          {milestone.tasks.length} task{milestone.tasks.length !== 1 ? "s" : ""} ·{" "}
          {formatProjectDate(milestone.plannedStartDate)}
        </p>
      </div>
      <span
        className="px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0 max-w-[5.5rem] sm:max-w-none truncate"
        style={{
          fontSize: "10px",
          fontWeight: 600,
          backgroundColor: msStatus.bg,
          color: msStatus.color,
        }}
      >
        {milestoneStatusFromApi(milestone.status)}
      </span>
      <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

function ProjectRow({
  project,
  isExpanded,
  onToggle,
  onSelectMilestone,
}: {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  onSelectMilestone: (projectId: string, milestoneId: string) => void;
}) {
  const statusConfig = getProjectStatusConfig(project.status);

  return (
    <div
      className="border rounded-xl overflow-hidden bg-white"
      style={{ borderColor: "var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-2 sm:gap-3 p-3 sm:p-4 text-left border-0 cursor-pointer transition-colors hover:bg-slate-50"
        style={{ backgroundColor: "white" }}
      >
        {isExpanded ? (
          <ChevronDown className="w-4 h-4 flex-shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-500" />
        )}
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--brand-light-green)" }}
        >
          <FolderKanban className="w-4 h-4" style={{ color: "var(--brand-green)" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-foreground truncate" style={{ fontSize: "14px", fontWeight: 600 }}>
            {project.customerName}
          </p>
          <p className="truncate hidden sm:block" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {project.projectCode} · {project.projectType} · {project.milestones.length} milestone
            {project.milestones.length !== 1 ? "s" : ""}
          </p>
          <p className="truncate sm:hidden" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            {project.projectCode} · {project.milestones.length} milestone
            {project.milestones.length !== 1 ? "s" : ""}
          </p>
        </div>
        <span
          className="px-2 sm:px-2.5 py-1 rounded-full flex-shrink-0 max-w-[5.5rem] sm:max-w-none truncate"
          style={{
            fontSize: "11px",
            fontWeight: 600,
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
          }}
        >
          {projectStatusFromApi(project.status)}
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: isExpanded ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden">
          <div style={{ borderTop: "1px solid var(--border)", backgroundColor: "#FAFAFA" }}>
            {project.milestones.length === 0 ? (
              <p className="px-4 py-3" style={{ fontSize: "12px", color: "var(--muted-foreground)", fontStyle: "italic" }}>
                No milestones for this project
              </p>
            ) : (
              project.milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  style={{
                    borderTop: index > 0 ? "1px solid var(--border)" : undefined,
                  }}
                >
                  <MilestoneRow
                    milestone={milestone}
                    projectId={project.id}
                    onSelect={onSelectMilestone}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskManagementProjectsList({ onSelectMilestone }: TaskManagementProjectsListProps) {
  const { projects } = useProjects();
  const [search, setSearch] = useState("");
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return projects;
    return projects.filter(
      (p) =>
        p.projectCode.toLowerCase().includes(query) ||
        p.customerName.toLowerCase().includes(query) ||
        p.projectType.toLowerCase().includes(query)
    );
  }, [projects, search]);

  const handleToggle = (projectId: string) => {
    setExpandedProjectId((prev) => (prev === projectId ? null : projectId));
  };

  return (
    <div className="min-w-0 p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h1
          className="text-foreground mb-1"
          style={{ fontSize: "clamp(1.125rem, 4vw, 1.25rem)", fontWeight: 700 }}
        >
          Task Management
        </h1>
        <p style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.5 }}>
          Select a project to view milestones, manage tasks, and maintain pick lists.
        </p>
      </div>

      <div className="relative mb-4 sm:mb-5 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 py-2.5 border rounded-lg bg-white"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ fontSize: "13px", borderColor: "var(--border)" }}
        />
      </div>

      <div className="space-y-3">
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12 border rounded-xl" style={{ borderColor: "var(--border)" }}>
            <FolderKanban
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--muted-foreground)", opacity: 0.4 }}
            />
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>No projects found</p>
          </div>
        ) : (
          filteredProjects.map((project) => (
            <ProjectRow
              key={project.id}
              project={project}
              isExpanded={expandedProjectId === project.id}
              onToggle={() => handleToggle(project.id)}
              onSelectMilestone={onSelectMilestone}
            />
          ))
        )}
      </div>
    </div>
  );
}
