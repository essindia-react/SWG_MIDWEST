import type { Project } from "../../../types/project";
import { formatProjectDate, getProjectStatusConfig } from "../../../lib/projectHelpers";
import { calculateBudgetSummary, formatBudgetCurrency } from "../../../lib/budgetHelpers";
import {
  ensureFieldOperations,
  generateWorkOrderNumber,
  getCrewLeader,
  getCrewMembers,
  getJobSiteAddress,
} from "./fieldOperationsHelpers";

export interface FieldOperationsTableRow {
  id: string;
  workOrderNumber: string;
  projectCode: string;
  customerName: string;
  jobSiteAddress: string;
  plannedStartDate: string;
  crewLeader: string;
  crewCount: number;
  estimatedCost: string;
  estimatedCostRaw: number;
  activitiesProgress: string;
  activitiesCompleted: number;
  activitiesTotal: number;
  workOrderSent: string;
  workOrderSentRaw: boolean;
  status: string;
  statusColor: string;
  statusBg: string;
  createdAt: string;
}

export function projectToFieldOperationsTableRow(
  project: Project,
  projectIndex: number
): FieldOperationsTableRow {
  const fieldOps = ensureFieldOperations(project, projectIndex);
  const statusConfig = getProjectStatusConfig(project.status);
  const budget = calculateBudgetSummary(project);
  const crewMembers = getCrewMembers(project);

  const activitiesCompleted = fieldOps.activities.filter(
    (activity) => activity.status === "Completed"
  ).length;
  const activitiesTotal = fieldOps.activities.length;

  return {
    id: project.id,
    workOrderNumber:
      fieldOps.workOrderNumber || generateWorkOrderNumber(Math.max(projectIndex, 0)),
    projectCode: project.projectCode,
    customerName: project.customerName,
    jobSiteAddress: getJobSiteAddress(project),
    plannedStartDate: formatProjectDate(project.plannedStartDate),
    crewLeader: getCrewLeader(project),
    crewCount: crewMembers.length,
    estimatedCost: formatBudgetCurrency(budget.totalEstimatedBudget),
    estimatedCostRaw: budget.totalEstimatedBudget,
    activitiesProgress:
      activitiesTotal > 0 ? `${activitiesCompleted}/${activitiesTotal}` : "—",
    activitiesCompleted,
    activitiesTotal,
    workOrderSent: fieldOps.sentToCrewLeader ? "Sent" : "Pending",
    workOrderSentRaw: fieldOps.sentToCrewLeader,
    status: statusConfig.label,
    statusColor: statusConfig.color,
    statusBg: statusConfig.bg,
    createdAt: project.createdAt,
  };
}
