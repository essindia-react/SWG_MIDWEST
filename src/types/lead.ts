export type LeadStatus =
  | "new"
  | "design"
  | "site_visit"
  | "estimate_sent"
  | "proposal_sent"
  | "won"
  | "lost";

export type LeadSource =
  | "web-form"
  | "phone"
  | "referral"
  | "social"
  | "walk-in"
  | "google-ads";

export type ProjectType =
  | "putting-green"
  | "artificial-turf"
  | "pet-turf"
  | "playground"
  | "sports-turf"
  | "tee-line"
  | "hardscape"
  | "landscaping"
  | "maintenance"
  | "other";

export type ProjectSubtype =
  | "outdoor"
  | "indoor"
  | "basement"
  | "commercial"
  | "residential";

export type PropertyType =
  | "residential"
  | "commercial"
  | "industrial"
  | "municipal";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type ExistingSurface = "grass" | "dirt" | "concrete" | "weeds" | "other";

export type TurfStyle = "pet-friendly" | "putting-green" | "landscape-premium";

export type FormPipelineStage =
  | "new"
  | "contacted"
  | "meeting_scheduled"
  | "quoting";

export type OhioRegion =
  | "columbus"
  | "cleveland"
  | "cincinnati"
  | "dayton"
  | "akron"
  | "toledo"
  | "parma"
  | "other-ohio";

export type BudgetRange =
  | "under-10k"
  | "10k-25k"
  | "25k-50k"
  | "50k-100k"
  | "over-100k";

export interface LeadUploadedDocument {
  id: string;
  documentType: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

export interface LeadUploadedImage {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  /** Resolved asset URL for bundled demo images */
  previewUrl?: string;
}

export interface LeadEstimationArea {
  id: string;
  areaName: string;
  areaType: string;
  areaLength: string;
  areaWidth: string;
  customArea: string;
}

export interface LeadEstimationProduct {
  id: string;
  forArea: string;
  productId?: string;
  productType: string;
  productName: string;
  unit: string;
  quantity: string;
  cost: number;
}

export interface LeadEstimationOverhead {
  id: string;
  title: string;
  rate: string;
  unit: string;
}

export interface LeadFollowUpActivity {
  id: string;
  title: string;
  description: string;
  date: string;
  proposalRef?: string;
  statusUpdate?: string;
}

export interface LeadWorkflowData {
  visitDate?: string;
  visitTime?: string;
  visitStatus?: string;
  surveyedBy?: string;
  assignedSalesRepName?: string;
  siteVisitScheduledDate?: string;
  siteAddress?: string;
  siteVisitImages?: LeadUploadedImage[];
  designId?: string;
  designName?: string;
  designStatus?: string;
  designCreatedBy?: string;
  /** @deprecated use designImages */
  designImage?: LeadUploadedImage;
  designImages?: LeadUploadedImage[];
  estimationNo?: string;
  estimationDate?: string;
  estimationCustomerName?: string;
  areaName?: string;
  installationTypes?: string[];
  estimationAreas?: LeadEstimationArea[];
  estimationProducts?: LeadEstimationProduct[];
  estimationOverheads?: LeadEstimationOverhead[];
  proposalId?: string;
  proposalStatus?: string;
  proposalName?: string;
  documents?: LeadUploadedDocument[];
  documentCount?: number;
  followUpActivities?: LeadFollowUpActivity[];
}

export interface Lead {
  id: string;
  leadNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  ohioRegion: OhioRegion;
  leadSource: LeadSource;
  projectType: ProjectType;
  propertyType: PropertyType;
  projectSubtype?: ProjectSubtype;
  squareFootageEstimate?: number;
  budgetRange?: BudgetRange;
  desiredInstallDate?: string;
  estimatedValue: number;
  priority: LeadPriority;
  existingSurface?: ExistingSurface;
  drainageRequired: boolean;
  removeExistingGrass: boolean;
  hoaApprovalRequired: boolean;
  turfStyle?: TurfStyle;
  coolingInfill?: boolean;
  customerRequirements?: string;
  internalNotes?: string;
  notes?: string;
  nextFollowUpDate?: string;
  assignedRep: string;
  status: LeadStatus;
  workflowData?: LeadWorkflowData;
  createdAt: string;
  updatedAt: string;
}

export type LeadFormInput = Omit<
  Lead,
  | "id"
  | "leadNumber"
  | "ohioRegion"
  | "estimatedValue"
  | "createdAt"
  | "updatedAt"
> & {
  manualEstimatedRevenue?: number;
  formPipelineStage?: FormPipelineStage;
};
