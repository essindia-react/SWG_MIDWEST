export interface WorkspaceFormValues {
  // Inquiry — Lead Information
  leadNo: string;
  leadDate: string;
  leadSource: string;
  leadType: string;
  // Inquiry — Customer Details
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContactMethod: string;
  companyName: string;
  existingClient: boolean;
  existingCustomerId: string;
  // Inquiry — Job Site Details
  jobSiteAddress: string;
  jobSiteCity: string;
  jobSiteState: string;
  jobSiteZip: string;
  jobSitePropertyType: string;
  // Inquiry — Project Details
  installationTypes: string[];
  approximateArea: string;
  projectDescription: string;
  estimatedProjectValue: string;
  expectedStartDate: string;
  siteVisitCompleted: boolean;
  siteVisitScheduledDate: string;
  // Inquiry — Assignment
  territoryBranch: string;
  assignedSalesRep: string;
  followUpDate: string;
  // Inquiry — Lead Status
  leadStatus: string;
  lostReason: string;
  priority: string;
  // Inquiry — Notes & Communication
  internalNotes: string;
  communicationLog: string;
  // Site Visit — Visit Info
  visitDate: string;
  visitTime: string;
  surveyedBy: string;
  visitStatus: string;
  // Site Visit — Location
  siteAddress: string;
  siteCity: string;
  siteZip: string;
  totalArea: string;
  length: string;
  width: string;
  // Site Visit — Conditions
  surfaceType: string;
  terrain: string;
  drainage: string;
  irrigationPresent: string;
  equipmentAccess: string;
  serviceType: string;
  budgetRange: string;
  // Site Visit — Obstacles
  obstacleTrees: boolean;
  obstacleFence: boolean;
  obstaclePool: boolean;
  obstacleLandscaping: boolean;
  // Design
  designId: string;
  designName: string;
  designStatus: string;
  designCreatedBy: string;
  designCreatedDate: string;
  designLastUpdated: string;
  // Estimation
  estimationNo: string;
  estimationDate: string;
  estimationCustomerName: string;
  areaName: string;
  areaType: string;
  areaLength: string;
  areaWidth: string;
  customArea: string;
  overheadTitle: string;
  overheadRate: string;
  overheadUnit: string;
  // Proposal
  proposalId: string;
  proposalName: string;
  proposalStatus: string;
  // Follow Up
  followUpCustomerName: string;
  proposalRef: string;
  statusUpdate: string;
  nextFollowUpDate: string;
  remarks: string;
  documentCount: number;
}

export const EMPTY_WORKSPACE_FORM: WorkspaceFormValues = {
  leadNo: "",
  leadDate: new Date().toISOString().slice(0, 10),
  leadSource: "Website Form",
  leadType: "Residential",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  preferredContactMethod: "Call",
  companyName: "",
  existingClient: false,
  existingCustomerId: "",
  jobSiteAddress: "",
  jobSiteCity: "",
  jobSiteState: "OH",
  jobSiteZip: "",
  jobSitePropertyType: "Residential",
  installationTypes: [],
  approximateArea: "",
  projectDescription: "",
  estimatedProjectValue: "",
  expectedStartDate: "",
  siteVisitCompleted: false,
  siteVisitScheduledDate: "",
  territoryBranch: "",
  assignedSalesRep: "Maria S.",
  followUpDate: "",
  leadStatus: "New",
  lostReason: "",
  priority: "Medium",
  internalNotes: "",
  communicationLog: "",
  visitDate: "",
  visitTime: "",
  surveyedBy: "",
  visitStatus: "Scheduled",
  siteAddress: "",
  siteCity: "",
  siteZip: "",
  totalArea: "",
  length: "",
  width: "",
  surfaceType: "Grass",
  terrain: "Flat",
  drainage: "Good",
  irrigationPresent: "no",
  equipmentAccess: "yes",
  serviceType: "Premium Turf",
  budgetRange: "$10k-$25k",
  obstacleTrees: false,
  obstacleFence: false,
  obstaclePool: false,
  obstacleLandscaping: false,
  designId: "DSN-8821",
  designName: "",
  designStatus: "Draft",
  designCreatedBy: "Carlos Ruiz",
  designCreatedDate: "2026-06-02",
  designLastUpdated: "2026-06-02 14:30",
  estimationNo: "EST-5510",
  estimationDate: new Date().toISOString().slice(0, 10),
  estimationCustomerName: "",
  areaName: "",
  areaType: "Main Turf",
  areaLength: "",
  areaWidth: "",
  customArea: "",
  overheadTitle: "",
  overheadRate: "",
  overheadUnit: "Flat Fee",
  proposalId: "PRP-9902",
  proposalName: "",
  proposalStatus: "Draft",
  followUpCustomerName: "",
  proposalRef: "PRP-9902",
  statusUpdate: "Decision Pending",
  nextFollowUpDate: "",
  remarks: "",
  documentCount: 6,
};

export type WorkspaceFormChange = <K extends keyof WorkspaceFormValues>(
  field: K,
  value: WorkspaceFormValues[K]
) => void;
