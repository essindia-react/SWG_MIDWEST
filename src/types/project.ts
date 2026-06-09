export type ProjectDocumentCategory = "Pre Site Images and Post" | "Proof of work";

export interface ProjectDocument {
  id: string;
  category: ProjectDocumentCategory;
  label: string;
  uploaded?: boolean;
  uploadedAt?: string;
  fileName?: string;
  fileSize?: number;
}

export type ProjectStatus =
  | "planning"
  | "in-progress"
  | "on-hold"
  | "completed"
  | "cancelled";

export type MilestoneStatus = "completed" | "in-progress" | "on-hold";

export type ProjectTaskStatus = "not-started" | "in-progress" | "completed" | "on-hold";

export interface ProjectTask {
  id: string;
  milestoneId: string;
  name: string;
  estimateEffortHrs: number;
  plannedStartDate: string;
  plannedEndDate: string;
  assignedTo: string;
  status: ProjectTaskStatus;
  fieldVisitTime?: string;
  fieldExitTime?: string;
  remarks?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  plannedStartDate: string;
  plannedEndDate: string;
  estimateEffortHrs: number;
  status: MilestoneStatus;
  tasks: ProjectTask[];
}

export interface TeamAssignment {
  id: string;
  userId: string;
  userName: string;
  role: string;
  startDate: string;
  endDate: string;
}

export interface MaterialCostLine {
  id: string;
  materialName: string;
  sku: string;
  unit: string;
  estimatedQuantity: number;
  unitCost: number;
  totalCost: number;
  source: string;
  notes: string;
}

export interface CrewCostLine {
  id: string;
  employeeName: string;
  role: string;
  estimatedHours: number;
  hourlyRate: number;
  totalLaborCost: number;
  workType: string;
}

export interface EquipmentCostLine {
  id: string;
  equipmentName: string;
  usageDays: number;
  dailyRate: number;
  totalCost: number;
  notes: string;
}

export interface OverheadExpenseLine {
  id: string;
  expenseDescription: string;
  category: string;
  estimatedAmount: number;
}

export interface ProjectBudget {
  materials: MaterialCostLine[];
  crew: CrewCostLine[];
  equipment: EquipmentCostLine[];
  overhead: OverheadExpenseLine[];
}

export type FieldDocumentType =
  | "Installation Guide"
  | "Safety Guide"
  | "HOA Rules"
  | "Design Drawing"
  | "Pre-Site Photo"
  | "Other";

export interface FieldGuideDocument {
  id: string;
  documentType: FieldDocumentType;
  fileNames: string[];
  description: string;
  uploadDate: string;
  uploadedBy: string;
}

export type PickListCategory = "Material" | "Equipment" | "Overhead";

export interface PickListItem {
  id: string;
  sourceLineId: string;
  category: PickListCategory;
  itemName: string;
  sku: string;
  quantityRequired: number;
  unit: string;
  pulledFromInventory: boolean;
  notes: string;
  /** @deprecated use sourceLineId */
  materialLineId?: string;
}

export type FieldActivityStatus = "Not Started" | "In Progress" | "Completed";

export interface FieldActivity {
  id: string;
  activityName: string;
  plannedDate: string;
  estimatedDurationDays: number;
  assignedTo: string;
  dependencyId: string;
  status: FieldActivityStatus;
}

export interface FieldOperations {
  workOrderNumber: string;
  specialInstructions: string;
  sentToCrewLeader: boolean;
  sentToCrewLeaderAt?: string;
  guideDocuments: FieldGuideDocument[];
  pickList: PickListItem[];
  activities: FieldActivity[];
}

export interface Project {
  id: string;
  projectCode: string;
  projectDate: string;
  customerId: string;
  customerName: string;
  proposalId?: string;
  proposalName?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  description: string;
  projectType: string;
  actualStartDate: string;
  actualEndDate: string;
  status: ProjectStatus;
  projectValue: number;
  projectManager: string;
  remarks: string;
  teamAssignments: TeamAssignment[];
  milestones: ProjectMilestone[];
  documents: ProjectDocument[];
  budget: ProjectBudget;
  fieldOperations?: FieldOperations;
  createdAt: string;
  updatedAt: string;
}

export type MilestoneWithTasksInput = MilestoneFormInput & {
  tasks?: Omit<ProjectTaskFormInput, "milestoneId">[];
};

export interface ProjectFormInput {
  customerId: string;
  customerName: string;
  proposalId?: string;
  proposalName?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  description: string;
  projectType: string;
  actualStartDate?: string;
  actualEndDate?: string;
  status?: ProjectStatus;
  projectValue?: number;
  projectManager: string;
  remarks?: string;
  teamAssignments?: TeamAssignmentFormInput[];
  milestones?: MilestoneWithTasksInput[];
}

export interface MilestoneFormInput {
  name: string;
  description: string;
  assignedTo: string;
  plannedStartDate: string;
  plannedEndDate: string;
  estimateEffortHrs: number;
  status: MilestoneStatus;
}

export interface ProjectTaskFormInput {
  milestoneId: string;
  name: string;
  estimateEffortHrs: number;
  plannedStartDate: string;
  plannedEndDate: string;
  assignedTo: string;
  status: ProjectTaskStatus;
  fieldVisitTime?: string;
  fieldExitTime?: string;
  remarks?: string;
}

export interface TeamAssignmentFormInput {
  userId: string;
  userName: string;
  role: string;
  startDate: string;
  endDate: string;
}
