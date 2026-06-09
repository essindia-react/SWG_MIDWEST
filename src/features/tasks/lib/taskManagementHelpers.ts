import type { Project, ProjectTask, ProjectTaskStatus } from "../../../types/project";

export interface FlatProjectTask {
  id: string;
  name: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  customerName: string;
  milestoneId: string;
  milestoneName: string;
  assignedTo: string;
  status: ProjectTaskStatus;
  plannedStartDate: string;
  plannedEndDate: string;
  estimateEffortHrs: number;
}

export function flattenProjectTasks(projects: Project[]): FlatProjectTask[] {
  const tasks: FlatProjectTask[] = [];

  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        tasks.push({
          id: task.id,
          name: task.name,
          projectId: project.id,
          projectCode: project.projectCode,
          projectName: project.customerName,
          customerName: project.customerName,
          milestoneId: milestone.id,
          milestoneName: milestone.name,
          assignedTo: task.assignedTo,
          status: task.status,
          plannedStartDate: task.plannedStartDate,
          plannedEndDate: task.plannedEndDate,
          estimateEffortHrs: task.estimateEffortHrs,
        });
      }
    }
  }

  return tasks;
}

export function isActiveTask(status: ProjectTaskStatus): boolean {
  return status === "not-started" || status === "in-progress";
}

export function getTaskStatusConfig(status: ProjectTaskStatus) {
  const config: Record<ProjectTaskStatus, { label: string; color: string; bg: string }> = {
    "not-started": { label: "New", color: "#0284C7", bg: "#EFF6FF" },
    "in-progress": { label: "In Progress", color: "#2E7D32", bg: "#E8F5E9" },
    completed: { label: "Completed", color: "#64748B", bg: "#F1F5F9" },
    "on-hold": { label: "On Hold", color: "#D97706", bg: "#FFF7ED" },
  };
  return config[status];
}

export function findTaskById(
  projects: Project[],
  taskId: string
): { task: ProjectTask; project: Project; milestoneName: string } | undefined {
  for (const project of projects) {
    for (const milestone of project.milestones) {
      const task = milestone.tasks.find((t) => t.id === taskId);
      if (task) {
        return { task, project, milestoneName: milestone.name };
      }
    }
  }
  return undefined;
}
