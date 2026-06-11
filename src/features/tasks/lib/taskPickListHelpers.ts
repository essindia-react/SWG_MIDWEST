import type { Project } from "../../../types/project";
import type { TaskManagementPickListItem } from "../types/taskManagementPickList";

export interface AssignedPickItem {
  sourceLineId: string;
  category: "Material" | "Equipment";
  itemName: string;
  sku: string;
  unit: string;
  quantityAvailable: number;
}

/** Budget line IDs assigned to each milestone (materials + equipment). */
const MILESTONE_BUDGET_LINES: Record<string, string[]> = {
  "p1-ms-1": ["p1-mat-3", "p1-eq-2"],
  "p1-ms-2": ["p1-mat-1", "p1-mat-2", "p1-mat-4", "p1-eq-1"],
  "p2-ms-1": ["p2-mat-3", "p2-eq-1"],
  "p2-ms-2": ["p2-mat-1", "p2-mat-2", "p2-mat-4", "p2-eq-2"],
  "p2-ms-3": [],
};

function materialToPickItem(
  line: Project["budget"]["materials"][number]
): AssignedPickItem {
  return {
    sourceLineId: line.id,
    category: "Material",
    itemName: line.materialName,
    sku: line.sku,
    unit: line.unit,
    quantityAvailable: line.estimatedQuantity,
  };
}

function equipmentToPickItem(
  line: Project["budget"]["equipment"][number]
): AssignedPickItem {
  return {
    sourceLineId: line.id,
    category: "Equipment",
    itemName: line.equipmentName,
    sku: "—",
    unit: "days",
    quantityAvailable: line.usageDays,
  };
}

export function getMilestoneAssignedPickItems(
  project: Project,
  milestoneId: string
): AssignedPickItem[] {
  const lineIds = MILESTONE_BUDGET_LINES[milestoneId] ?? [];
  const budget = project.budget;
  const items: AssignedPickItem[] = [];

  for (const lineId of lineIds) {
    const material = budget.materials.find((line) => line.id === lineId);
    if (material) {
      items.push(materialToPickItem(material));
      continue;
    }
    const equipment = budget.equipment.find((line) => line.id === lineId);
    if (equipment) {
      items.push(equipmentToPickItem(equipment));
    }
  }

  return items;
}

type PickListSeed = Omit<TaskManagementPickListItem, "id">;

const TASK_PICK_LIST_SEEDS: Record<string, PickListSeed[]> = {
  "project-1:p1-ms-1:p1-task-1": [
    {
      fieldName: "Site Preparation",
      itemName: "Crushed Aggregate Base",
      sku: "AGG-CRUSH-01",
      quantityRequired: 42,
      unit: "bag",
      category: "Material",
      sourceLineId: "p1-mat-3",
      pulledFromInventory: true,
      notes: "Allocated from project budget — drainage correction",
    },
    {
      fieldName: "Site Preparation",
      itemName: "Dump Trailer",
      sku: "—",
      quantityRequired: 2,
      unit: "days",
      category: "Equipment",
      sourceLineId: "p1-eq-2",
      pulledFromInventory: false,
      notes: "Sod haul-off rental",
    },
  ],
  "project-1:p1-ms-2:p1-task-2": [
    {
      fieldName: "Turf Installation",
      itemName: "Premium Landscape Turf 15mm",
      sku: "TURF-PREM-15",
      quantityRequired: 1200,
      unit: "sq ft",
      category: "Material",
      sourceLineId: "p1-mat-1",
      pulledFromInventory: true,
      notes: "First turf laydown section",
    },
    {
      fieldName: "Turf Installation",
      itemName: "Plate Compactor",
      sku: "—",
      quantityRequired: 2,
      unit: "days",
      category: "Equipment",
      sourceLineId: "p1-eq-1",
      pulledFromInventory: false,
      notes: "Base compaction before turf",
    },
  ],
  "project-1:p1-ms-2:p1-task-3": [
    {
      fieldName: "Turf Installation",
      itemName: "Premium Landscape Turf 15mm",
      sku: "TURF-PREM-15",
      quantityRequired: 600,
      unit: "sq ft",
      category: "Material",
      sourceLineId: "p1-mat-1",
      pulledFromInventory: false,
      notes: "Remaining turf section",
    },
    {
      fieldName: "Turf Installation",
      itemName: "Seam Tape Roll",
      sku: "TAPE-SEAM-01",
      quantityRequired: 4,
      unit: "roll",
      category: "Material",
      sourceLineId: "p1-mat-4",
      pulledFromInventory: false,
      notes: "Seaming along patio edge",
    },
    {
      fieldName: "Turf Installation",
      itemName: "Silica Sand Infill 50lb",
      sku: "INFILL-SIL-50",
      quantityRequired: 18,
      unit: "bag",
      category: "Material",
      sourceLineId: "p1-mat-2",
      pulledFromInventory: false,
      notes: "Final infill pass",
    },
  ],
  "project-2:p2-ms-1:p2-task-1": [
    {
      fieldName: "Field Grading & Drainage",
      itemName: "Drainage Mat Roll",
      sku: "DRN-MAT-01",
      quantityRequired: 4,
      unit: "roll",
      category: "Material",
      sourceLineId: "p2-mat-3",
      pulledFromInventory: true,
      notes: "Perimeter drainage strips",
    },
  ],
  "project-2:p2-ms-1:p2-task-2": [
    {
      fieldName: "Field Grading & Drainage",
      itemName: "Skid Steer Loader",
      sku: "—",
      quantityRequired: 3,
      unit: "days",
      category: "Equipment",
      sourceLineId: "p2-eq-1",
      pulledFromInventory: false,
      notes: "Rough grading",
    },
    {
      fieldName: "Field Grading & Drainage",
      itemName: "Drainage Mat Roll",
      sku: "DRN-MAT-01",
      quantityRequired: 6,
      unit: "roll",
      category: "Material",
      sourceLineId: "p2-mat-3",
      pulledFromInventory: true,
      notes: "Field edge drainage",
    },
  ],
  "project-2:p2-ms-2:p2-task-3": [
    {
      fieldName: "Turf Installation",
      itemName: "Drainage Mat Roll",
      sku: "DRN-MAT-01",
      quantityRequired: 10,
      unit: "roll",
      category: "Material",
      sourceLineId: "p2-mat-2",
      pulledFromInventory: true,
      notes: "Shock pad underlayment layer",
    },
  ],
  "project-2:p2-ms-2:p2-task-4": [
    {
      fieldName: "Turf Installation",
      itemName: "Premium Landscape Turf 15mm",
      sku: "TURF-PREM-15",
      quantityRequired: 3000,
      unit: "sq ft",
      category: "Material",
      sourceLineId: "p2-mat-1",
      pulledFromInventory: true,
      notes: "Sports field turf laydown",
    },
    {
      fieldName: "Turf Installation",
      itemName: "Power Broom",
      sku: "—",
      quantityRequired: 1,
      unit: "days",
      category: "Equipment",
      sourceLineId: "p2-eq-2",
      pulledFromInventory: false,
      notes: "Turf grooming during install",
    },
  ],
  "project-2:p2-ms-2:p2-task-5": [
    {
      fieldName: "Turf Installation",
      itemName: "Silica Sand Infill 50lb",
      sku: "INFILL-SIL-50",
      quantityRequired: 26,
      unit: "bag",
      category: "Material",
      sourceLineId: "p2-mat-4",
      pulledFromInventory: false,
      notes: "Field infill top-dress",
    },
    {
      fieldName: "Turf Installation",
      itemName: "Power Broom",
      sku: "—",
      quantityRequired: 2,
      unit: "days",
      category: "Equipment",
      sourceLineId: "p2-eq-2",
      pulledFromInventory: false,
      notes: "Infill grooming",
    },
  ],
};

function taskSeedKey(projectId: string, milestoneId: string, taskId: string): string {
  return `${projectId}:${milestoneId}:${taskId}`;
}

export function getTaskPickListSeeds(
  projectId: string,
  milestoneId: string,
  taskId: string
): PickListSeed[] {
  return TASK_PICK_LIST_SEEDS[taskSeedKey(projectId, milestoneId, taskId)] ?? [];
}

export function getAllTaskPickListSeedsForProjects(
  projects: Project[]
): Record<string, PickListSeed[]> {
  const seeds: Record<string, PickListSeed[]> = { ...TASK_PICK_LIST_SEEDS };

  for (const project of projects) {
    for (const milestone of project.milestones) {
      for (const task of milestone.tasks) {
        const key = taskSeedKey(project.id, milestone.id, task.id);
        if (!seeds[key]) {
          seeds[key] = [];
        }
      }
    }
  }

  return seeds;
}

/** Materials assigned to the project budget (inventory catalog only). */
export function getProjectAssignedMaterials(project: Project): AssignedPickItem[] {
  return project.budget.materials.map(materialToPickItem);
}
