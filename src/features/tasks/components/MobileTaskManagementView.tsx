import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CheckSquare,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Package,
  Truck,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "../../../hooks/useProjects";
import {
  formatProjectDate,
  getProjectStatusConfig,
  getProjectsForSiteSupervisor,
} from "../../../lib/projectHelpers";
import { FIELD_SITE_SUPERVISOR } from "../../projects/constants/projectConstants";
import type { Project, ProjectMilestone, ProjectTask } from "../../../types/project";
import {
  milestoneStatusFromApi,
  taskStatusFromApi,
} from "../../projects/constants/projectConstants";
import { MobileMaterialRequestView } from "../../site-material-request/components/MobileMaterialRequestView";
import { getProjectAssignedMaterials } from "../lib/taskPickListHelpers";
import type { FlatProjectTask } from "../lib/taskManagementHelpers";
import {
  flattenProjectTasks,
  getTaskStatusConfig,
} from "../lib/taskManagementHelpers";
import {
  getMaterialRequestsForTask,
  MATERIAL_REQUEST_STATUS_LABELS,
} from "../lib/taskMaterialRequestHelpers";
import { MobilePhoneFrame } from "./MobilePhoneFrame";

type MobileScreen = "dashboard" | "project-detail" | "task-detail" | "material-request";

function TaskListItem({
  task,
  onSelect,
}: {
  task: FlatProjectTask;
  onSelect: (task: FlatProjectTask) => void;
}) {
  const statusConfig = getTaskStatusConfig(task.status);

  return (
    <button
      type="button"
      onClick={() => onSelect(task)}
      className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors hover:border-green-200"
      style={{
        borderColor: "var(--border)",
        backgroundColor: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: statusConfig.bg }}
      >
        <CheckSquare className="w-4 h-4" style={{ color: statusConfig.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-foreground truncate" style={{ fontSize: "13px", fontWeight: 600 }}>
          {task.name}
        </p>
        <p className="truncate mt-0.5" style={{ fontSize: "11px", color: "var(--muted-foreground)" }}>
          {task.milestoneName} · {task.projectCode}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span
          className="px-2 py-0.5 rounded-full"
          style={{
            fontSize: "10px",
            fontWeight: 600,
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
          }}
        >
          {statusConfig.label}
        </span>
        <ChevronRight className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
      </div>
    </button>
  );
}

function DashboardScreen({
  projects,
  supervisorProjects,
  selectedProjectId,
  onProjectChange,
  onSelectTask,
}: {
  projects: { id: string; projectCode: string; customerName: string }[];
  supervisorProjects: Project[];
  selectedProjectId: string;
  onProjectChange: (id: string) => void;
  onSelectTask: (task: FlatProjectTask) => void;
}) {
  const allTasks = useMemo(
    () => flattenProjectTasks(supervisorProjects),
    [supervisorProjects]
  );

  const filteredTasks = useMemo(() => {
    if (!selectedProjectId) return allTasks;
    return allTasks.filter((t) => t.projectId === selectedProjectId);
  }, [allTasks, selectedProjectId]);

  const newTasks = filteredTasks.filter((t) => t.status === "not-started");
  const activeTasks = filteredTasks.filter((t) => t.status === "in-progress");
  const completedTasks = filteredTasks.filter((t) => t.status === "completed");

  return (
    <>
      <div className="px-4 sm:px-5 pt-3 pb-4" style={{ backgroundColor: "var(--brand-dark-green)" }}>
        <p className="text-white" style={{ fontSize: "11px", opacity: 0.7 }}>
          Field Crew App
        </p>
        <p className="text-white" style={{ fontSize: "clamp(1rem, 4vw, 1.125rem)", fontWeight: 700 }}>
          Tasks Dashboard
        </p>
        <p className="text-white mt-1" style={{ fontSize: "11px", opacity: 0.65 }}>
          {FIELD_SITE_SUPERVISOR.name} · Site Supervisor — {projects.length} project
          {projects.length !== 1 ? "s" : ""} assigned
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 min-w-0">
        <label
          className="block mb-1"
          style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}
        >
          Project
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border outline-none mb-4"
          style={{ fontSize: "13px", borderColor: "var(--border)", backgroundColor: "white" }}
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.projectCode} — {p.customerName}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-5">
          {[
            { label: "New", value: newTasks.length, color: "#0284C7", bg: "#EFF6FF" },
            { label: "Active", value: activeTasks.length, color: "#2E7D32", bg: "#E8F5E9" },
            { label: "Done", value: completedTasks.length, color: "#64748B", bg: "#F1F5F9" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl px-3 py-2.5 text-center border"
              style={{ borderColor: "var(--border)", backgroundColor: stat.bg }}
            >
              <p style={{ fontSize: "18px", fontWeight: 700, color: stat.color }}>{stat.value}</p>
              <p style={{ fontSize: "10px", color: "var(--muted-foreground)", fontWeight: 500 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {newTasks.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 700 }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "#0284C7" }} />
              New Tasks ({newTasks.length})
            </h3>
            <div className="space-y-2">
              {newTasks.map((task) => (
                <TaskListItem key={task.id} task={task} onSelect={onSelectTask} />
              ))}
            </div>
          </div>
        )}

        {activeTasks.length > 0 && (
          <div className="mb-5">
            <h3 className="mb-2 flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 700 }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: "var(--brand-green)" }} />
              In Progress ({activeTasks.length})
            </h3>
            <div className="space-y-2">
              {activeTasks.map((task) => (
                <TaskListItem key={task.id} task={task} onSelect={onSelectTask} />
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mb-5">
            <h3
              className="mb-2"
              style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted-foreground)" }}
            >
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <TaskListItem key={task.id} task={task} onSelect={onSelectTask} />
              ))}
            </div>
          </div>
        )}

        {filteredTasks.length === 0 && (
          <div className="text-center py-10">
            <CheckSquare
              className="w-10 h-10 mx-auto mb-3"
              style={{ color: "var(--muted-foreground)", opacity: 0.4 }}
            />
            <p style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
              No tasks found for this project
            </p>
          </div>
        )}
      </div>
    </>
  );
}

function MilestoneTaskRow({
  task,
  isSelected,
  onSelect,
}: {
  task: ProjectTask;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const statusConfig = getTaskStatusConfig(task.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-left border-0 cursor-pointer"
      style={{
        backgroundColor: isSelected ? "rgba(46, 125, 50, 0.08)" : "transparent",
        borderTop: "1px solid var(--border)",
      }}
    >
      <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#64748B" }} />
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: "12px", fontWeight: isSelected ? 600 : 500 }}>{task.name}</p>
        <p style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
          {task.assignedTo || "Unassigned"}
          {task.estimateEffortHrs ? ` · ${task.estimateEffortHrs}h` : ""}
        </p>
      </div>
      <span
        className="px-2 py-0.5 rounded-full flex-shrink-0"
        style={{
          fontSize: "9px",
          fontWeight: 600,
          backgroundColor: statusConfig.bg,
          color: statusConfig.color,
        }}
      >
        {taskStatusFromApi(task.status)}
      </span>
      <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "var(--muted-foreground)" }} />
    </button>
  );
}

function MilestoneCard({
  milestone,
  selectedTaskId,
  onSelectTask,
}: {
  milestone: ProjectMilestone;
  selectedTaskId: string | null;
  onSelectTask: (task: ProjectTask, milestoneName: string) => void;
}) {
  const msStatus = getProjectStatusConfig(
    milestone.status as "completed" | "in-progress" | "on-hold"
  );

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--border)", backgroundColor: "white" }}
    >
      <div className="flex items-center gap-2 px-3 py-2.5" style={{ backgroundColor: "var(--muted)" }}>
        <Flag className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: "13px", fontWeight: 600 }}>{milestone.name}</p>
          <p style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
            {milestone.assignedTo || "Unassigned"} ·{" "}
            {formatProjectDate(milestone.plannedStartDate)}
            {milestone.plannedEndDate ? ` – ${formatProjectDate(milestone.plannedEndDate)}` : ""}
          </p>
        </div>
        <span
          className="px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            fontSize: "9px",
            fontWeight: 600,
            backgroundColor: msStatus.bg,
            color: msStatus.color,
          }}
        >
          {milestoneStatusFromApi(milestone.status)}
        </span>
      </div>

      {milestone.tasks.length === 0 ? (
        <p className="px-3 py-2.5" style={{ fontSize: "11px", color: "var(--muted-foreground)", fontStyle: "italic" }}>
          No tasks in this milestone
        </p>
      ) : (
        milestone.tasks.map((task) => (
          <MilestoneTaskRow
            key={task.id}
            task={task}
            isSelected={selectedTaskId === task.id}
            onSelect={() => onSelectTask(task, milestone.name)}
          />
        ))
      )}
    </div>
  );
}

function ProjectDetailScreen({
  project,
  projects,
  highlightedTaskId,
  onBack,
  onProjectChange,
  onSelectTask,
}: {
  project: Project;
  projects: { id: string; projectCode: string; customerName: string }[];
  highlightedTaskId: string | null;
  onBack: () => void;
  onProjectChange: (id: string) => void;
  onSelectTask: (task: ProjectTask, milestoneName: string) => void;
}) {
  return (
    <>
      <div className="px-5 pt-3 pb-4" style={{ backgroundColor: "var(--brand-dark-green)" }}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 mb-2 bg-transparent border-0 p-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-white opacity-70" />
          <span className="text-white" style={{ fontSize: "12px", opacity: 0.7 }}>
            Back to Dashboard
          </span>
        </button>
        <p className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
          {project.customerName}
        </p>
        <p className="text-white mt-1" style={{ fontSize: "11px", opacity: 0.65 }}>
          {project.projectCode} · {project.projectType}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <label
          className="block mb-1"
          style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)" }}
        >
          Project
        </label>
        <select
          value={project.id}
          onChange={(e) => onProjectChange(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border outline-none mb-4"
          style={{ fontSize: "13px", borderColor: "var(--border)", backgroundColor: "white" }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.projectCode} — {p.customerName}
            </option>
          ))}
        </select>

        <h3 className="mb-3" style={{ fontSize: "12px", fontWeight: 700 }}>
          Milestones & Tasks
        </h3>

        {project.milestones.length === 0 ? (
          <p className="text-center py-8" style={{ fontSize: "13px", color: "var(--muted-foreground)" }}>
            No milestones for this project
          </p>
        ) : (
          <div className="space-y-3">
            {project.milestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                selectedTaskId={highlightedTaskId}
                onSelectTask={onSelectTask}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function TaskMaterialRequestsMobile({ task }: { task: FlatProjectTask }) {
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("material-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("material-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const requests = useMemo(
    () => getMaterialRequestsForTask(task.projectCode, task.id, task.name),
    [task.projectCode, task.id, task.name, refreshKey]
  );

  if (requests.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="mb-2" style={{ fontSize: "12px", fontWeight: 700 }}>
        Material Requests
      </p>
      <div className="space-y-2">
        {requests.map((request) => {
          const statusConfig = MATERIAL_REQUEST_STATUS_LABELS[request.status];
          return (
            <div
              key={request.id}
              className="p-3 rounded-xl border"
              style={{ borderColor: "var(--border)", backgroundColor: statusConfig.bg }}
            >
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: statusConfig.color,
                    textTransform: "uppercase",
                  }}
                >
                  {statusConfig.label}
                </span>
                <span style={{ fontSize: "11px", fontWeight: 600 }}>{request.requestNumber}</span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
                {request.itemName} · {request.quantityNeeded} {request.unit}
              </p>
              {request.status === "approved" && statusConfig.message && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Truck className="w-3.5 h-3.5" style={{ color: "#2E7D32" }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "#2E7D32" }}>
                    {statusConfig.message}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TaskDetailScreen({
  task,
  onBack,
  onMarkComplete,
  onRequestMaterial,
}: {
  task: FlatProjectTask;
  onBack: () => void;
  onMarkComplete: () => void;
  onRequestMaterial: () => void;
}) {
  const statusConfig = getTaskStatusConfig(task.status);
  const isCompleted = task.status === "completed";

  return (
    <>
      <div className="px-5 pt-3 pb-4" style={{ backgroundColor: "var(--brand-dark-green)" }}>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 mb-2 bg-transparent border-0 p-0 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-white opacity-70" />
          <span className="text-white" style={{ fontSize: "12px", opacity: 0.7 }}>
            Back to Project
          </span>
        </button>
        <p className="text-white" style={{ fontSize: "18px", fontWeight: 700 }}>
          {task.name}
        </p>
        <p className="text-white mt-1" style={{ fontSize: "11px", opacity: 0.65 }}>
          {task.projectCode} — {task.projectName}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="px-2.5 py-1 rounded-full"
            style={{
              fontSize: "11px",
              fontWeight: 600,
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
            }}
          >
            {statusConfig.label}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {[
            { icon: Flag, label: "Milestone", value: task.milestoneName },
            { icon: User, label: "Assigned To", value: task.assignedTo || "Unassigned" },
            {
              icon: Clock,
              label: "Planned Dates",
              value: `${formatProjectDate(task.plannedStartDate)} – ${formatProjectDate(task.plannedEndDate)}`,
            },
            {
              icon: Clock,
              label: "Estimated Effort",
              value: `${task.estimateEffortHrs} hours`,
            },
          ].map((row) => {
            const Icon = row.icon;
            return (
              <div
                key={row.label}
                className="flex items-start gap-3 p-3 rounded-xl border"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--muted)" }}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
                <div>
                  <p style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted-foreground)" }}>
                    {row.label}
                  </p>
                  <p style={{ fontSize: "13px", fontWeight: 500, marginTop: "2px" }}>{row.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <TaskMaterialRequestsMobile task={task} />

        <div className="space-y-3">
          {!isCompleted && (
            <button
              type="button"
              onClick={onMarkComplete}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold"
              style={{ backgroundColor: "var(--brand-green)", fontSize: "14px" }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Complete
            </button>
          )}

          {isCompleted && (
            <div
              className="flex items-center justify-center gap-2 py-3 rounded-xl"
              style={{
                backgroundColor: "#F0FDF4",
                fontSize: "14px",
                color: "var(--brand-green)",
                fontWeight: 600,
              }}
            >
              <CheckCircle2 className="w-4 h-4" />
              Task Completed
            </div>
          )}

          <button
            type="button"
            onClick={onRequestMaterial}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold border"
            style={{
              borderColor: "var(--brand-green)",
              color: "var(--brand-green)",
              backgroundColor: "white",
              fontSize: "14px",
            }}
          >
            <Package className="w-4 h-4" />
            Request Material
          </button>
        </div>
      </div>
    </>
  );
}

function toFlatTask(task: ProjectTask, project: Project, milestoneName: string): FlatProjectTask {
  return {
    id: task.id,
    name: task.name,
    projectId: project.id,
    projectCode: project.projectCode,
    projectName: project.customerName,
    customerName: project.customerName,
    milestoneId: task.milestoneId,
    milestoneName,
    assignedTo: task.assignedTo,
    status: task.status,
    plannedStartDate: task.plannedStartDate,
    plannedEndDate: task.plannedEndDate,
    estimateEffortHrs: task.estimateEffortHrs,
  };
}

export function MobileTaskManagementView({ standalone = false }: { standalone?: boolean }) {
  const { projects: allProjects, getProjectById, updateTask } = useProjects();
  const projects = useMemo(
    () => getProjectsForSiteSupervisor(allProjects, FIELD_SITE_SUPERVISOR.id),
    [allProjects]
  );
  const [screen, setScreen] = useState<MobileScreen>("dashboard");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<FlatProjectTask | null>(null);

  const projectOptions = useMemo(
    () =>
      projects.map((p) => ({
        id: p.id,
        projectCode: p.projectCode,
        customerName: p.customerName,
      })),
    [projects]
  );

  const activeProject = selectedProjectId ? getProjectById(selectedProjectId) : undefined;

  const openProject = (projectId: string, taskId: string | null = null) => {
    setSelectedProjectId(projectId);
    setHighlightedTaskId(taskId);
    setScreen("project-detail");
  };

  const handleSelectTaskFromDashboard = (task: FlatProjectTask) => {
    openProject(task.projectId, task.id);
  };

  const handleProjectChangeFromDashboard = (projectId: string) => {
    setSelectedProjectId(projectId);
    if (projectId) {
      openProject(projectId);
    }
  };

  const handleProjectChangeFromDetail = (projectId: string) => {
    setSelectedProjectId(projectId);
    setHighlightedTaskId(null);
    setSelectedTask(null);
  };

  const handleSelectTaskFromProject = (task: ProjectTask, milestoneName: string) => {
    if (!activeProject) return;
    setHighlightedTaskId(task.id);
    setSelectedTask(toFlatTask(task, activeProject, milestoneName));
    setScreen("task-detail");
  };

  const handleMarkComplete = () => {
    if (!selectedTask) return;

    updateTask(selectedTask.projectId, selectedTask.milestoneId, selectedTask.id, {
      status: "completed",
    });

    setSelectedTask((prev) => (prev ? { ...prev, status: "completed" } : null));
    toast.success("Task marked as complete");
  };

  const content =
    screen === "material-request" && selectedTask && activeProject ? (
      <MobileMaterialRequestView
        embedded
        taskContext={{
          projectCode: activeProject.projectCode,
          projectName: `${activeProject.customerName} — ${activeProject.projectType}`,
          taskId: selectedTask.id,
          taskName: selectedTask.name,
          milestoneName: selectedTask.milestoneName,
          requestedBy: selectedTask.assignedTo || "Field Crew",
          assignedMaterials: getProjectAssignedMaterials(activeProject),
        }}
        onClose={() => setScreen("task-detail")}
      />
    ) : screen === "task-detail" && selectedTask ? (
      <TaskDetailScreen
        task={selectedTask}
        onBack={() => {
          setScreen("project-detail");
          setSelectedTask(null);
        }}
        onMarkComplete={handleMarkComplete}
        onRequestMaterial={() => setScreen("material-request")}
      />
    ) : screen === "project-detail" && activeProject ? (
      <ProjectDetailScreen
        project={activeProject}
        projects={projectOptions}
        highlightedTaskId={highlightedTaskId}
        onBack={() => {
          setScreen("dashboard");
          setSelectedProjectId("");
          setHighlightedTaskId(null);
        }}
        onProjectChange={handleProjectChangeFromDetail}
        onSelectTask={handleSelectTaskFromProject}
      />
    ) : (
      <DashboardScreen
        projects={projectOptions}
        supervisorProjects={projects}
        selectedProjectId={selectedProjectId}
        onProjectChange={handleProjectChangeFromDashboard}
        onSelectTask={handleSelectTaskFromDashboard}
      />
    );

  if (standalone) {
    return <MobilePhoneFrame>{content}</MobilePhoneFrame>;
  }

  return (
    <div
      className="flex flex-col lg:flex-row justify-center items-stretch lg:items-start h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 gap-6 lg:gap-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="w-full max-w-[390px] mx-auto lg:mx-0 rounded-3xl overflow-hidden flex flex-col flex-shrink-0 min-h-[min(780px,100dvh-8rem)] lg:min-h-[780px]"
        style={{
          backgroundColor: "white",
          boxShadow: "0 25px 80px rgba(0,0,0,0.18), 0 0 0 12px #1B1B1B",
        }}
      >
        <div
          className="hidden sm:flex items-center justify-between px-5 pt-3 pb-1"
          style={{ backgroundColor: "var(--brand-dark-green)" }}
        >
          <span className="text-white" style={{ fontSize: "12px", fontWeight: 600 }}>
            9:41
          </span>
          <div className="flex gap-0.5">
            {[4, 3, 2, 1].map((h) => (
              <div
                key={h}
                className="w-1 bg-white rounded-sm"
                style={{ height: `${h * 3}px`, opacity: h === 1 ? 0.4 : 1 }}
              />
            ))}
          </div>
        </div>
        {content}
      </div>

      <div className="w-full max-w-md lg:max-w-72 flex-shrink-0 lg:self-center px-1 sm:px-0">
        <h3 className="text-foreground mb-3" style={{ fontSize: "16px", fontWeight: 700 }}>
          Field Task Management
        </h3>
        <p className="mb-4" style={{ fontSize: "13px", color: "var(--muted-foreground)", lineHeight: 1.7 }}>
          Mobile dashboard for crew members to view assigned tasks, mark work complete, and request
          additional materials on-site.
        </p>
        <div className="space-y-2">
          {[
            "Filter tasks by project",
            "View milestones and tasks per project",
            "Mark tasks as complete",
            "Request materials without leaving the app",
            "Opens in new tab for field use",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--brand-green)" }} />
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
