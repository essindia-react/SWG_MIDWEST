import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  ThemeProvider,
  Typography,
} from "@mui/material";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useCalendarEvents } from "../../../../hooks/useCalendarEvents";
import { useLeads } from "../../../../hooks/useLeads";
import { useNotifications } from "../../../../hooks/useNotifications";
import { getLeadFullName } from "../../../../lib/leadHelpers";
import { SALES_REPS } from "../../../../lib/constants";
import { generateLeadNumber } from "../../../../lib/leadDefaults";
import { getOhioRegionLabel } from "../../../../lib/leadHelpers";
import { formatPhone, parsePhoneToDigits } from "../../../../lib/formatters";
import { zipToOhioRegion } from "../../../../lib/zipToRegion";
import { theme } from "../../../../theme/theme";
import type {
  LeadFormInput,
  LeadPriority,
  LeadSource,
  LeadStatus,
  LeadWorkflowData,
  PropertyType,
} from "../../../../types/lead";
import { DesignStep } from "./DesignStep";
import { DocumentsStep } from "./DocumentsStep";
import { EstimationStep } from "./EstimationStep";
import { FollowUpStep } from "./FollowUpStep";
import { InquiryStep } from "./InquiryStep";
import { ProposalStep } from "./ProposalStep";
import { SiteVisitStep } from "./SiteVisitStep";
import { EMPTY_WORKSPACE_FORM, type WorkspaceFormValues } from "./types";
import { WORKSPACE_STEPS } from "./workspaceSteps";
import { WorkspaceVerticalStepper } from "./WorkspaceVerticalStepper";

interface LeadWorkspaceProps {
  onBack: () => void;
}

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
  HOA: "municipal",
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

const PRIORITY_TO_API: Record<string, LeadPriority> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

const REGION_TO_REP: Record<string, string> = {
  columbus: "Maria S.",
  cleveland: "Emily C.",
  cincinnati: "Chris W.",
  dayton: "Alex J.",
  akron: "Emily C.",
  toledo: "Alex J.",
  parma: "Emily C.",
  "other-ohio": "Maria S.",
};

const STEP_NEXT_LABELS: Record<number, string> = {
  0: "Schedule Site Visit",
  1: "Select Design",
  2: "Convert to Estimation",
  3: "Convert to Customer",
};

function getNextStepLabel(activeStep: number): string {
  if (activeStep === WORKSPACE_STEPS.length - 1) return "Complete Workflow";
  return STEP_NEXT_LABELS[activeStep] ?? "Save & Next Step";
}

function SaveOptionsButton() {
  const [hovered, setHovered] = useState(false);

  return (
    <Box
      sx={{ position: "relative" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {hovered && (
        <Box
          sx={{
            position: "absolute",
            bottom: "calc(100% + 4px)",
            right: 0,
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            boxShadow: 2,
            py: 0.5,
            zIndex: 1,
            minWidth: 140,
          }}
        >
          <Button
            size="small"
            color="inherit"
            onClick={() => toast.info("Draft saved locally for this session")}
            sx={{ justifyContent: "flex-start", px: 2, py: 1, borderRadius: 0 }}
          >
            As Draft
          </Button>
          <Button
            size="small"
            color="inherit"
            onClick={() => toast.success("Changes saved")}
            sx={{ justifyContent: "flex-start", px: 2, py: 1, borderRadius: 0 }}
          >
            Save
          </Button>
        </Box>
      )}
      <Button variant="outlined" color="inherit">
        Save
      </Button>
    </Box>
  );
}

function getCustomerName(values: WorkspaceFormValues): string {
  return `${values.firstName} ${values.lastName}`.trim();
}

function getRepIdByName(name: string): string {
  return SALES_REPS.find((rep) => rep.name === name)?.id ?? SALES_REPS[0].id;
}

function applyZipAutoFill(values: WorkspaceFormValues): WorkspaceFormValues {
  const zip = values.jobSiteZip.replace(/\D/g, "").slice(0, 5);
  if (zip.length < 3) return values;

  const region = zipToOhioRegion(zip);
  return {
    ...values,
    territoryBranch: getOhioRegionLabel(region),
    assignedSalesRep: REGION_TO_REP[region] ?? values.assignedSalesRep,
  };
}

function toWorkflowData(
  values: WorkspaceFormValues,
  documentCount = 0
): LeadWorkflowData {
  const customerName = getCustomerName(values);
  return {
    visitDate: values.visitDate || values.siteVisitScheduledDate || undefined,
    visitTime: values.visitTime || undefined,
    visitStatus: values.visitStatus || undefined,
    surveyedBy: values.surveyedBy || undefined,
    assignedSalesRepName: values.assignedSalesRep || undefined,
    siteVisitScheduledDate: values.siteVisitScheduledDate || undefined,
    siteAddress: values.siteAddress || values.jobSiteAddress || undefined,
    designId: values.designId || undefined,
    designName: values.designName || undefined,
    designStatus: values.designStatus || undefined,
    designCreatedBy: values.designCreatedBy || undefined,
    estimationNo: values.estimationNo || undefined,
    estimationDate: values.estimationDate || undefined,
    estimationCustomerName: values.estimationCustomerName || customerName,
    areaName: values.areaName || undefined,
    proposalId: values.proposalId || undefined,
    proposalStatus: values.proposalStatus || undefined,
    proposalName: values.proposalName || `Proposal - ${customerName}`,
    documentCount,
  };
}

function toLeadInput(values: WorkspaceFormValues): LeadFormInput {
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
    leadSource: LEAD_SOURCE_TO_API[values.leadSource] ?? "web-form",
    projectType: "artificial-turf",
    propertyType: JOB_SITE_PROPERTY_TO_API[values.jobSitePropertyType] ?? "residential",
    squareFootageEstimate: values.approximateArea ? Number(values.approximateArea) : undefined,
    desiredInstallDate: values.expectedStartDate || undefined,
    manualEstimatedRevenue: values.estimatedProjectValue
      ? Number(values.estimatedProjectValue)
      : undefined,
    customerRequirements: values.projectDescription.trim() || undefined,
    internalNotes: values.internalNotes.trim() || undefined,
    notes: values.internalNotes.trim() || values.remarks.trim() || undefined,
    nextFollowUpDate: values.followUpDate || values.nextFollowUpDate || undefined,
    assignedRep: getRepIdByName(values.assignedSalesRep),
    status: LEAD_STATUS_TO_API[values.leadStatus] ?? "new",
    priority: PRIORITY_TO_API[values.priority] ?? "medium",
    drainageRequired: values.drainage === "Poor",
    removeExistingGrass: values.surfaceType === "Grass",
    hoaApprovalRequired: values.leadType === "HOA" || values.jobSitePropertyType === "HOA",
    workflowData: toWorkflowData(values, values.documentCount),
  };
}

const JOB_SITE_TO_SITE_FIELDS = {
  jobSiteAddress: "siteAddress",
  jobSiteCity: "siteCity",
  jobSiteZip: "siteZip",
} as const;

export function LeadWorkspace({ onBack }: LeadWorkspaceProps) {
  const { addLead } = useLeads();
  const { addNotification } = useNotifications();
  const { addEventFromLead } = useCalendarEvents();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState<WorkspaceFormValues>(() => ({
    ...EMPTY_WORKSPACE_FORM,
    leadNo: generateLeadNumber(),
  }));

  const handleChange = useCallback(
    <K extends keyof WorkspaceFormValues>(field: K, value: WorkspaceFormValues[K]) => {
      setForm((prev) => {
        let next = { ...prev, [field]: value };

        if (field === "firstName" || field === "lastName") {
          const customerName = getCustomerName(next);
          next.estimationCustomerName = customerName;
          next.followUpCustomerName = customerName;
        }

        if (field in JOB_SITE_TO_SITE_FIELDS) {
          const siteField =
            JOB_SITE_TO_SITE_FIELDS[field as keyof typeof JOB_SITE_TO_SITE_FIELDS];
          next[siteField] = String(value);
        }

        if (field === "approximateArea") {
          next.totalArea = String(value);
        }

        if (field === "followUpDate") {
          next.nextFollowUpDate = String(value);
        }

        if (field === "siteVisitScheduledDate" && value) {
          if (!next.visitDate) next.visitDate = String(value);
        }

        if (field === "jobSiteZip") {
          next = applyZipAutoFill(next);
        }

        return next;
      });
    },
    []
  );

  const handleNext = () => {
    if (activeStep < WORKSPACE_STEPS.length - 1) {
      setActiveStep((s) => s + 1);
      return;
    }
    const newLead = addLead(toLeadInput(form));
    const customerName = getLeadFullName(newLead);

    addNotification({
      type: "new-lead",
      title: "New Lead Created",
      message: `${customerName} — Lead #${newLead.leadNumber} added to pipeline`,
      leadId: newLead.id,
    });

    const calendarEvent = addEventFromLead(newLead);
    if (calendarEvent) {
      toast.success(`Site visit scheduled for ${calendarEvent.date}`);
    }

    toast.success(`Lead #${newLead.leadNumber} created successfully`);
    onBack();
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((s) => s - 1);
    }
  };

  const headerTitle =
    activeStep === 0
      ? "Create New Lead"
      : `Lead #${form.leadNo}${form.territoryBranch ? ` / ${form.territoryBranch}` : ""}`;

  const renderStepContent = (stepId: number) => {
    switch (stepId) {
      case 1:
        return <InquiryStep values={form} onChange={handleChange} />;
      case 2:
        return <SiteVisitStep values={form} onChange={handleChange} />;
      case 3:
        return <DesignStep values={form} leadNumber={form.leadNo} onChange={handleChange} />;
      case 4:
        return <EstimationStep values={form} onChange={handleChange} />;
      case 5:
        return <ProposalStep values={form} leadNumber={form.leadNo} onChange={handleChange} />;
      case 6:
        return <FollowUpStep values={form} onChange={handleChange} />;
      case 7:
        return (
          <DocumentsStep
            onCountChange={(count) => handleChange("documentCount", count)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={onBack} size="small">
              <ArrowLeft size={20} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
              {headerTitle}
            </Typography>
          </Box>
          <IconButton onClick={onBack} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <WorkspaceVerticalStepper
            steps={WORKSPACE_STEPS}
            activeStep={activeStep}
            onStepClick={setActiveStep}
          />

          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
              <Box sx={{ maxWidth: 896, mx: "auto" }}>
                {renderStepContent(WORKSPACE_STEPS[activeStep].id)}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 4,
                py: 2,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.paper",
                flexShrink: 0,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Unsaved changes will be lost.
              </Typography>
              <Box sx={{ display: "flex", gap: 1.5 }}>
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ArrowLeft size={16} />}
                  onClick={handleBack}
                  disabled={activeStep === 0}
                >
                  Back
                </Button>
                <SaveOptionsButton />
                <Button
                  variant="contained"
                  color="primary"
                  endIcon={
                    activeStep === WORKSPACE_STEPS.length - 1 ? (
                      <CheckCircle size={16} />
                    ) : (
                      <ArrowRight size={16} />
                    )
                  }
                  onClick={handleNext}
                >
                  {getNextStepLabel(activeStep)}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
