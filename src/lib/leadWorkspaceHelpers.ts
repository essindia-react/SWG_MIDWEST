import { LEAD_SOURCES, PRIORITY_CONFIG, SALES_REPS } from "./constants";
import { formatPhone, parsePhoneToDigits, formatCurrency, formatDate } from "./formatters";
import {
  getLeadFullName,
  getLeadSourceLabel,
  getOhioRegionLabel,
  getProjectTypeLabel,
  getRepById,
} from "./leadHelpers";
import type {
  Lead,
  LeadFormInput,
  LeadSource,
  LeadStatus,
  LeadUploadedImage,
  LeadWorkflowData,
  PropertyType,
} from "../types/lead";
import {
  EMPTY_WORKSPACE_FORM,
  type WorkspaceFormValues,
} from "../features/leads/components/workspace/types";
import { WORKSPACE_STEPS } from "../features/leads/components/workspace/workspaceSteps";
import {
  getProposalsForCustomer,
  PROJECT_CUSTOMERS,
} from "../features/projects/constants/projectConstants";

export interface LeadWorkspaceStepProgress {
  label: string;
  done: boolean;
  index: number;
}

export interface LeadStageDetailField {
  label: string;
  value: string;
}

export interface LeadStageDetailListItem {
  primary: string;
  secondary?: string;
  imageUrl?: string;
}

export interface LeadStageGalleryImage {
  url: string;
  label: string;
}

export interface LeadStageDetail {
  index: number;
  label: string;
  done: boolean;
  fields: LeadStageDetailField[];
  listItems?: LeadStageDetailListItem[];
  galleryImages?: LeadStageGalleryImage[];
  emptyMessage?: string;
}

function toGalleryImages(images: LeadUploadedImage[] | undefined): LeadStageGalleryImage[] {
  return (images ?? [])
    .filter((img) => img.previewUrl)
    .map((img) => ({ url: img.previewUrl!, label: img.fileName }));
}

export interface LeadProposalSummary {
  id: string;
  name: string;
  status: string;
  estimationId?: string;
  designId?: string;
  updatedAt?: string;
}

function getDesignImages(wd: LeadWorkflowData): LeadUploadedImage[] {
  return wd.designImages ?? (wd.designImage ? [wd.designImage] : []);
}

function isWorkspaceStepComplete(stepIndex: number, lead: Lead): boolean {
  const wd = lead.workflowData ?? {};

  switch (stepIndex) {
    case 0:
      return true;
    case 1:
      return Boolean(wd.visitDate || wd.siteVisitScheduledDate || wd.visitStatus);
    case 2:
      return Boolean(wd.designId || wd.designName);
    case 3:
      return Boolean(wd.estimationNo || (wd.estimationAreas?.length ?? 0) > 0);
    case 4:
      return Boolean(wd.proposalId || wd.proposalName);
    case 5:
      return Boolean((wd.documents?.length ?? 0) > 0 || (wd.documentCount ?? 0) > 0);
    default:
      return false;
  }
}

export function getLeadWorkspaceStepProgress(lead: Lead): LeadWorkspaceStepProgress[] {
  return WORKSPACE_STEPS.map((step, index) => ({
    label: step.label,
    done: isWorkspaceStepComplete(index, lead),
    index,
  }));
}

export function getDefaultLeadStageIndex(lead: Lead): number {
  const progress = getLeadWorkspaceStepProgress(lead);
  const lastDone = progress
    .map((step, index) => (step.done ? index : -1))
    .filter((index) => index >= 0)
    .pop();
  return lastDone ?? 0;
}

function displayValue(value: string | number | undefined | null, fallback = "—"): string {
  if (value === undefined || value === null || value === "") return fallback;
  return String(value);
}

export function getLeadStageDetail(lead: Lead, stageIndex: number): LeadStageDetail {
  const step = WORKSPACE_STEPS[stageIndex];
  const wd = lead.workflowData ?? {};
  const rep = getRepById(lead.assignedRep);
  const customerName = getLeadFullName(lead);
  const done = isWorkspaceStepComplete(stageIndex, lead);

  switch (stageIndex) {
    case 0:
      return {
        index: stageIndex,
        label: step.label,
        done,
        fields: [
          { label: "Lead No", value: lead.leadNumber },
          { label: "Lead Date", value: formatDate(lead.createdAt) },
          { label: "Customer Name", value: customerName },
          { label: "Email", value: lead.email },
          { label: "Phone", value: lead.phone },
          { label: "Company", value: displayValue(lead.company) },
          { label: "Job Site Address", value: displayValue(lead.address) },
          { label: "City / State / ZIP", value: [lead.city, lead.state, lead.zipCode].filter(Boolean).join(", ") || "—" },
          { label: "Lead Source", value: getLeadSourceLabel(lead.leadSource) },
          { label: "Project Type", value: getProjectTypeLabel(lead.projectType) },
          { label: "Approx. Area", value: lead.squareFootageEstimate ? `${lead.squareFootageEstimate.toLocaleString()} sq ft` : "—" },
          { label: "Estimated Value", value: formatCurrency(lead.estimatedValue) },
          { label: "Priority", value: PRIORITY_CONFIG[lead.priority]?.label ?? lead.priority },
          { label: "Assigned Rep", value: wd.assignedSalesRepName ?? rep.name },
          { label: "Requirements", value: displayValue(lead.customerRequirements) },
        ],
        emptyMessage: done ? undefined : "Inquiry details will appear once the lead is created.",
      };

    case 1:
      return {
        index: stageIndex,
        label: step.label,
        done,
        fields: [
          { label: "Visit Date", value: displayValue(wd.visitDate || wd.siteVisitScheduledDate) },
          { label: "Visit Time", value: displayValue(wd.visitTime) },
          { label: "Visit Status", value: displayValue(wd.visitStatus, "Scheduled") },
          { label: "Surveyed By", value: displayValue(wd.surveyedBy) },
          { label: "Site Address", value: displayValue(wd.siteAddress ?? lead.address) },
          { label: "Site Images", value: wd.siteVisitImages?.length ? `${wd.siteVisitImages.length} uploaded` : "—" },
        ],
        listItems: wd.siteVisitImages?.map((img) => ({
          primary: img.fileName,
          secondary: img.uploadedAt ? formatDate(img.uploadedAt) : undefined,
          imageUrl: img.previewUrl,
        })),
        galleryImages: toGalleryImages(wd.siteVisitImages),
        emptyMessage: "No site visit scheduled yet.",
      };

    case 2: {
      const designImages = getDesignImages(wd);
      return {
        index: stageIndex,
        label: step.label,
        done,
        fields: [
          { label: "Design ID", value: displayValue(wd.designId) },
          { label: "Design Name", value: displayValue(wd.designName) },
          { label: "Design Status", value: displayValue(wd.designStatus, "Draft") },
          { label: "Created By", value: displayValue(wd.designCreatedBy, rep.name) },
          {
            label: "Design Images",
            value: designImages.length ? `${designImages.length} uploaded` : "—",
          },
        ],
        listItems: designImages.map((img) => ({
          primary: img.fileName,
          secondary: img.uploadedAt ? formatDate(img.uploadedAt) : undefined,
          imageUrl: img.previewUrl,
        })),
        galleryImages: toGalleryImages(designImages),
        emptyMessage: "No design created for this lead yet.",
      };
    }

    case 3: {
      const areas = wd.estimationAreas ?? [];
      const products = wd.estimationProducts ?? [];
      const overheads = wd.estimationOverheads ?? [];
      return {
        index: stageIndex,
        label: step.label,
        done,
        fields: [
          { label: "Estimation No", value: displayValue(wd.estimationNo) },
          { label: "Estimation Date", value: wd.estimationDate ? formatDate(wd.estimationDate) : "—" },
          { label: "Customer", value: displayValue(wd.estimationCustomerName, customerName) },
          { label: "Areas", value: areas.length ? `${areas.length} defined` : displayValue(wd.areaName) },
          { label: "Products", value: products.length ? `${products.length} line item(s)` : "—" },
          { label: "Overheads", value: overheads.length ? `${overheads.length} entry(ies)` : "—" },
        ],
        listItems: [
          ...areas.map((area, i) => ({
            primary: area.areaName || `Area ${i + 1}`,
            secondary: [area.areaType, area.areaLength && area.areaWidth ? `${area.areaLength}×${area.areaWidth} ft` : null]
              .filter(Boolean)
              .join(" · "),
          })),
          ...products.map((product) => ({
            primary: product.productName || product.productType,
            secondary: `${product.quantity || "0"} ${product.unit}`,
          })),
          ...overheads
            .filter((oh) => oh.title)
            .map((oh) => ({
              primary: oh.title,
              secondary: `${oh.rate || "0"} (${oh.unit})`,
            })),
        ],
        emptyMessage: "No estimation created for this lead yet.",
      };
    }

    case 4:
      return {
        index: stageIndex,
        label: step.label,
        done,
        fields: [
          { label: "Proposal ID", value: displayValue(wd.proposalId) },
          { label: "Proposal Name", value: displayValue(wd.proposalName, `Proposal - ${customerName}`) },
          { label: "Proposal Status", value: displayValue(wd.proposalStatus, "Draft") },
          { label: "Estimation Ref", value: displayValue(wd.estimationNo) },
          { label: "Design Ref", value: displayValue(wd.designId) },
          { label: "Estimated Value", value: formatCurrency(lead.estimatedValue) },
          { label: "Assigned Rep", value: wd.assignedSalesRepName ?? rep.name },
        ],
        emptyMessage: "No proposal created for this lead yet.",
      };

    case 5: {
      const docs = wd.documents ?? [];
      return {
        index: stageIndex,
        label: step.label,
        done,
        fields: [
          { label: "Customer", value: customerName },
          { label: "Lead ID", value: lead.leadNumber },
          { label: "Documents", value: docs.length ? `${docs.length} uploaded` : displayValue(wd.documentCount, "0") },
        ],
        listItems: docs.map((doc) => ({
          primary: doc.fileName,
          secondary: doc.documentType,
        })),
        emptyMessage: "No documents uploaded yet.",
      };
    }

    default:
      return {
        index: stageIndex,
        label: step?.label ?? "Stage",
        done: false,
        fields: [],
        emptyMessage: "No details available.",
      };
  }
}

function findMatchingCustomer(lead: Lead) {
  const fullName = getLeadFullName(lead).toLowerCase();
  return PROJECT_CUSTOMERS.find(
    (customer) =>
      customer.email.toLowerCase() === lead.email.toLowerCase() ||
      customer.name.toLowerCase() === fullName ||
      (lead.company && customer.name.toLowerCase() === lead.company.toLowerCase())
  );
}

export function getLeadProposals(lead: Lead): LeadProposalSummary[] {
  const wd = lead.workflowData;
  const proposals: LeadProposalSummary[] = [];

  if (wd?.proposalId || wd?.proposalName) {
    proposals.push({
      id: wd.proposalId ?? "—",
      name: wd.proposalName ?? `Proposal - ${getLeadFullName(lead)}`,
      status: wd.proposalStatus ?? "Draft",
      estimationId: wd.estimationNo,
      designId: wd.designId,
      updatedAt: lead.updatedAt,
    });
  }

  const customer = findMatchingCustomer(lead);
  if (customer) {
    for (const proposal of getProposalsForCustomer(customer.id)) {
      if (!proposals.some((entry) => entry.id === proposal.id)) {
        proposals.push({
          id: proposal.id,
          name: proposal.name,
          status: proposal.status,
          estimationId: wd?.estimationNo,
          designId: wd?.designId,
          updatedAt: lead.updatedAt,
        });
      }
    }
  }

  return proposals;
}

const API_TO_LEAD_SOURCE: Record<LeadSource, string> = {
  "web-form": "Website Form",
  "google-ads": "Google Ad",
  referral: "Referral",
  social: "Instagram",
  phone: "Phone Call",
  "walk-in": "Walk-in",
};

const API_TO_PROPERTY_TYPE: Record<PropertyType, string> = {
  residential: "Residential",
  commercial: "Commercial",
  industrial: "Commercial",
  municipal: "Municipal",
};

const API_TO_LEAD_STATUS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  consulted: "Site Visit Scheduled",
  quoted: "Estimate Sent",
  won: "Won",
  lost: "Lost",
  nurturing: "Nurture",
};

const API_TO_PRIORITY: Record<string, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
  urgent: "High",
};

export function leadToWorkspaceForm(lead: Lead): WorkspaceFormValues {
  const wd = lead.workflowData ?? {};
  const rep = getRepById(lead.assignedRep);
  const customerName = `${lead.firstName} ${lead.lastName}`.trim();

  return {
    ...EMPTY_WORKSPACE_FORM,
    leadNo: lead.leadNumber,
    leadDate: lead.createdAt.slice(0, 10),
    leadSource:
      LEAD_SOURCES.find((s) => s.value === lead.leadSource)?.label ??
      API_TO_LEAD_SOURCE[lead.leadSource] ??
      "Website Form",
    leadType: lead.hoaApprovalRequired ? "HOA" : API_TO_PROPERTY_TYPE[lead.propertyType],
    firstName: lead.firstName,
    lastName: lead.lastName,
    email: lead.email,
    phone: lead.phone,
    companyName: lead.company ?? "",
    jobSiteAddress: lead.address,
    jobSiteCity: lead.city,
    jobSiteState: lead.state,
    jobSiteZip: lead.zipCode,
    jobSitePropertyType: API_TO_PROPERTY_TYPE[lead.propertyType] ?? "Residential",
    approximateArea: lead.squareFootageEstimate ? String(lead.squareFootageEstimate) : "",
    projectDescription: lead.customerRequirements ?? "",
    estimatedProjectValue: lead.estimatedValue ? String(lead.estimatedValue) : "",
    expectedStartDate: lead.desiredInstallDate ?? "",
    siteVisitScheduledDate: wd.siteVisitScheduledDate ?? "",
    territoryBranch: getOhioRegionLabel(lead.ohioRegion),
    assignedSalesRep: wd.assignedSalesRepName ?? rep.name,
    followUpDate: lead.nextFollowUpDate ?? "",
    leadStatus: API_TO_LEAD_STATUS[lead.status] ?? "New",
    priority: API_TO_PRIORITY[lead.priority] ?? "Medium",
    internalNotes: lead.internalNotes ?? lead.notes ?? "",
    visitDate: wd.visitDate ?? "",
    visitTime: wd.visitTime ?? "",
    surveyedBy: wd.surveyedBy ?? "",
    visitStatus: wd.visitStatus ?? "Scheduled",
    siteAddress: wd.siteAddress ?? lead.address,
    siteCity: lead.city,
    siteZip: lead.zipCode,
    totalArea: lead.squareFootageEstimate ? String(lead.squareFootageEstimate) : "",
    surfaceType: lead.removeExistingGrass ? "Grass" : "Dirt",
    drainage: lead.drainageRequired ? "Poor" : "Good",
    siteVisitImages: wd.siteVisitImages ?? [],
    designId: wd.designId ?? EMPTY_WORKSPACE_FORM.designId,
    designName: wd.designName ?? "",
    designStatus: wd.designStatus ?? "Draft",
    designCreatedBy: wd.designCreatedBy ?? EMPTY_WORKSPACE_FORM.designCreatedBy,
    designImages: getDesignImages(wd),
    estimationNo: wd.estimationNo ?? EMPTY_WORKSPACE_FORM.estimationNo,
    estimationDate: wd.estimationDate ?? new Date().toISOString().slice(0, 10),
    estimationCustomerName: wd.estimationCustomerName ?? customerName,
    areaName: wd.areaName ?? "",
    estimationAreas:
      wd.estimationAreas ??
      (wd.areaName
        ? [
            {
              id: "area-1",
              areaName: wd.areaName,
              areaType: "Main Turf",
              areaLength: "",
              areaWidth: "",
              customArea: "",
            },
          ]
        : EMPTY_WORKSPACE_FORM.estimationAreas),
    estimationProducts: wd.estimationProducts ?? [],
    estimationOverheads: wd.estimationOverheads ?? EMPTY_WORKSPACE_FORM.estimationOverheads,
    proposalId: wd.proposalId ?? EMPTY_WORKSPACE_FORM.proposalId,
    proposalName: wd.proposalName ?? "",
    proposalStatus: wd.proposalStatus ?? "Draft",
    followUpCustomerName: customerName,
    proposalRef: wd.proposalId ?? EMPTY_WORKSPACE_FORM.proposalRef,
    nextFollowUpDate: lead.nextFollowUpDate ?? "",
    uploadedDocuments: wd.documents ?? [],
    documentCount: wd.documentCount ?? wd.documents?.length ?? 0,
  };
}

export function workspaceFormToLeadInput(
  values: WorkspaceFormValues,
  existing?: Lead
): LeadFormInput {
  const LEAD_SOURCE_TO_API: Record<string, LeadSource> = {
    "Website Form": "web-form",
    "Google Ad": "google-ads",
    Referral: "referral",
    Instagram: "social",
    Facebook: "social",
    "Angi/HomeAdvisor": "web-form",
    "Walk-in": "walk-in",
    "Phone Call": "phone",
    "Trade Show": "referral",
    Other: "web-form",
  };

  const JOB_SITE_PROPERTY_TO_API: Record<string, PropertyType> = {
    Residential: "residential",
    Commercial: "commercial",
    "Sports Facility": "commercial",
    Municipal: "municipal",
  };

  const LEAD_STATUS_TO_API: Record<string, LeadStatus> = {
    New: "new",
    Contacted: "contacted",
    "Site Visit Scheduled": "consulted",
    "Estimate Sent": "quoted",
    "Follow-up": "nurturing",
    Won: "won",
    Lost: "lost",
    Nurture: "nurturing",
  };

  const customerName = `${values.firstName} ${values.lastName}`.trim();

  const workflowData = {
    visitDate: values.visitDate || values.siteVisitScheduledDate || undefined,
    visitTime: values.visitTime || undefined,
    visitStatus: values.visitStatus || undefined,
    surveyedBy: values.surveyedBy || undefined,
    assignedSalesRepName: values.assignedSalesRep || undefined,
    siteVisitScheduledDate: values.siteVisitScheduledDate || undefined,
    siteAddress: values.siteAddress || values.jobSiteAddress || undefined,
    siteVisitImages: values.siteVisitImages.length ? values.siteVisitImages : undefined,
    designId: values.designId || undefined,
    designName: values.designName || undefined,
    designStatus: values.designStatus || undefined,
    designCreatedBy: values.designCreatedBy || undefined,
    designImages: values.designImages.length ? values.designImages : undefined,
    estimationNo: values.estimationNo || undefined,
    estimationDate: values.estimationDate || undefined,
    estimationCustomerName: values.estimationCustomerName || customerName,
    areaName: values.estimationAreas[0]?.areaName || values.areaName || undefined,
    estimationAreas: values.estimationAreas,
    estimationProducts: values.estimationProducts,
    estimationOverheads: values.estimationOverheads,
    proposalId: values.proposalId || undefined,
    proposalStatus: values.proposalStatus || undefined,
    proposalName: values.proposalName || `Proposal - ${customerName}`,
    documents: values.uploadedDocuments.length ? values.uploadedDocuments : undefined,
    documentCount: values.uploadedDocuments.length || values.documentCount,
    followUpActivities: existing?.workflowData?.followUpActivities,
  };

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: formatPhone(parsePhoneToDigits(values.phone)),
    company: values.companyName.trim() || undefined,
    address: values.jobSiteAddress.trim() || values.siteAddress.trim(),
    city: values.jobSiteCity.trim(),
    state: values.jobSiteState,
    zipCode: values.jobSiteZip.replace(/\D/g, "").slice(0, 5),
    leadSource: LEAD_SOURCE_TO_API[values.leadSource] ?? existing?.leadSource ?? "web-form",
    projectType: existing?.projectType ?? "artificial-turf",
    propertyType:
      JOB_SITE_PROPERTY_TO_API[values.jobSitePropertyType] ??
      existing?.propertyType ??
      "residential",
    squareFootageEstimate: values.approximateArea
      ? Number(values.approximateArea)
      : existing?.squareFootageEstimate,
    desiredInstallDate: values.expectedStartDate || undefined,
    manualEstimatedRevenue: values.estimatedProjectValue
      ? Number(values.estimatedProjectValue)
      : undefined,
    customerRequirements: values.projectDescription.trim() || undefined,
    internalNotes: values.internalNotes.trim() || undefined,
    notes: values.internalNotes.trim() || values.remarks.trim() || undefined,
    nextFollowUpDate: values.followUpDate || values.nextFollowUpDate || undefined,
    assignedRep:
      SALES_REPS.find((r) => r.name === values.assignedSalesRep)?.id ??
      existing?.assignedRep ??
      SALES_REPS[0].id,
    status: LEAD_STATUS_TO_API[values.leadStatus] ?? existing?.status ?? "new",
    priority:
      values.priority === "High"
        ? "high"
        : values.priority === "Low"
          ? "low"
          : "medium",
    drainageRequired: values.drainage === "Poor",
    removeExistingGrass: values.surfaceType === "Grass",
    hoaApprovalRequired:
      values.jobSitePropertyType === "Municipal",
    workflowData,
  };
}
