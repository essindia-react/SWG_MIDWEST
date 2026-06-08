import { getCustomerById } from "../../projects/constants/projectConstants";
import type {
  FieldActivity,
  FieldOperations,
  PickListItem,
  Project,
  ProjectBudget,
} from "../../../types/project";

export function generateWorkOrderNumber(projectIndex: number): string {
  const year = new Date().getFullYear();
  const seq = String(projectIndex + 1).padStart(4, "0");
  return `SWG-WO-${year}-${seq}`;
}

export function buildPickListFromBudget(budget: ProjectBudget): PickListItem[] {
  const materials = budget.materials.map((line) => ({
    id: `pick-mat-${line.id}`,
    sourceLineId: line.id,
    category: "Material" as const,
    itemName: line.materialName,
    sku: line.sku,
    quantityRequired: line.estimatedQuantity,
    unit: line.unit,
    pulledFromInventory: false,
    notes: line.notes,
  }));

  const equipment = budget.equipment.map((line) => ({
    id: `pick-eq-${line.id}`,
    sourceLineId: line.id,
    category: "Equipment" as const,
    itemName: line.equipmentName,
    sku: "—",
    quantityRequired: line.usageDays,
    unit: "days",
    pulledFromInventory: false,
    notes: line.notes,
  }));

  const overhead = budget.overhead.map((line) => ({
    id: `pick-oh-${line.id}`,
    sourceLineId: line.id,
    category: "Overhead" as const,
    itemName: line.expenseDescription,
    sku: line.category,
    quantityRequired: line.estimatedAmount,
    unit: "USD",
    pulledFromInventory: false,
    notes: "",
  }));

  return [...materials, ...equipment, ...overhead];
}

function normalizePickListItem(item: PickListItem): PickListItem {
  return {
    ...item,
    sourceLineId: item.sourceLineId ?? item.materialLineId ?? item.id,
    category: item.category ?? "Material",
  };
}

function mergePickListWithBudget(existing: PickListItem[], budget: ProjectBudget): PickListItem[] {
  const normalized = existing.map(normalizePickListItem);
  const fromBudget = buildPickListFromBudget(budget);
  const existingSourceIds = new Set(normalized.map((item) => `${item.category}-${item.sourceLineId}`));
  const missing = fromBudget.filter(
    (item) => !existingSourceIds.has(`${item.category}-${item.sourceLineId}`)
  );
  return [...normalized, ...missing];
}

export function buildActivitiesFromMilestones(project: Project): FieldActivity[] {
  const activities: FieldActivity[] = [];

  project.milestones.forEach((milestone) => {
    activities.push({
      id: `activity-ms-${milestone.id}`,
      activityName: milestone.name,
      plannedDate: milestone.plannedStartDate,
      estimatedDurationDays: Math.max(
        1,
        Math.ceil((milestone.estimateEffortHrs || 8) / 8)
      ),
      assignedTo: milestone.assignedTo,
      dependencyId: activities.length > 0 ? activities[activities.length - 1].id : "",
      status: milestone.status === "completed" ? "Completed" : "Not Started",
    });

    milestone.tasks.forEach((task) => {
      activities.push({
        id: `activity-task-${task.id}`,
        activityName: task.name,
        plannedDate: task.plannedStartDate,
        estimatedDurationDays: Math.max(1, Math.ceil((task.estimateEffortHrs || 8) / 8)),
        assignedTo: task.assignedTo,
        dependencyId: activities.length > 0 ? activities[activities.length - 1].id : "",
        status:
          task.status === "completed"
            ? "Completed"
            : task.status === "in-progress"
              ? "In Progress"
              : "Not Started",
      });
    });
  });

  return activities;
}

export function getDefaultFieldOperations(project: Project, index: number): FieldOperations {
  return {
    workOrderNumber: generateWorkOrderNumber(index),
    specialInstructions: "",
    sentToCrewLeader: false,
    guideDocuments: [],
    pickList: buildPickListFromBudget(project.budget),
    activities: buildActivitiesFromMilestones(project),
  };
}

export function getJobSiteAddress(project: Project): string {
  const customer = getCustomerById(project.customerId);
  return customer?.address ?? "Address not available";
}

export function getCrewLeader(project: Project): string {
  const leader = project.teamAssignments.find(
    (member) =>
      member.role === "Lead Installer" ||
      member.role === "Site Supervisor" ||
      member.role === "Project Manager"
  );
  return leader?.userName ?? project.teamAssignments[0]?.userName ?? "Not assigned";
}

export function getCrewMembers(project: Project): string[] {
  return project.teamAssignments.map((member) => member.userName);
}

export function ensureFieldOperations(
  project: Project,
  projectIndex: number
): FieldOperations {
  if (project.fieldOperations) {
    const pickList = mergePickListWithBudget(
      project.fieldOperations.pickList.length > 0
        ? project.fieldOperations.pickList
        : [],
      project.budget
    );
    const activities =
      project.fieldOperations.activities.length > 0
        ? project.fieldOperations.activities
        : buildActivitiesFromMilestones(project);

    return {
      ...project.fieldOperations,
      pickList,
      activities,
    };
  }

  return getDefaultFieldOperations(project, projectIndex);
}
