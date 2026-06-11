import React from "react";
import { Grid } from "@mui/material";
import { ALL_US_STATES, SALES_REPS } from "../../../../lib/constants";
import { WorkspaceSection } from "./WorkspaceSection";
import {
  LabeledSelectField,
  MultiSelectField,
  SelectField,
  TextFieldInput,
  ToggleField,
} from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const LEAD_SOURCES = [
  "Website Form",
  "Google Ad",
  "Referral",
  "Instagram",
  "Facebook",
  "Angi/HomeAdvisor",
  "Walk-in",
  "Phone Call",
  "Trade Show",
  "Other",
] as const;

const LEAD_TYPES = ["Residential", "Commercial", "Municipal", "Sports Field"] as const;

const CONTACT_METHODS = ["Call", "Text", "Email"] as const;

const JOB_SITE_PROPERTY_TYPES = [
  "Residential",
  "Commercial",
  "Sports Facility",
  "Municipal",
] as const;

const INSTALLATION_TYPES = [
  "Backyard",
  "Frontyard",
  "Putting Green",
  "Pet Turf",
  "Rooftop",
  "Sports Field",
  "Commercial Landscaping",
] as const;

const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Site Visit Scheduled",
  "Estimate Sent",
  "Follow-up",
  "Won",
  "Lost",
  "Nurture",
] as const;

const LOST_REASONS = [
  "Price Too High",
  "No Response",
  "Went with Competitor",
  "Project Cancelled",
  "Other",
] as const;

const PRIORITIES = ["High", "Medium", "Low"] as const;

const EXISTING_CUSTOMERS = [
  "Henderson Estate — SWG-CUST-1024",
  "Park Estates Dev. — SWG-CUST-1156",
  "Rivera Pool & Turf — SWG-CUST-1188",
  "Sunbelt Properties — SWG-CUST-1201",
] as const;

const SALES_REP_NAMES = SALES_REPS.map((rep) => rep.name);

interface InquiryStepProps {
  values: WorkspaceFormValues;
  onChange: WorkspaceFormChange;
}

export function InquiryStep({ values, onChange }: InquiryStepProps) {
  return (
    <>
      <WorkspaceSection title="Lead Information">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Lead No"
              value={values.leadNo}
              onChange={(v) => onChange("leadNo", v)}
              disabled
              placeholder="SWG-LEAD-OHIO-2026-21"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Lead Date"
              type="date"
              value={values.leadDate}
              onChange={(v) => onChange("leadDate", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Lead Source"
              value={values.leadSource}
              onChange={(v) => onChange("leadSource", v)}
              options={LEAD_SOURCES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Lead Type"
              value={values.leadType}
              onChange={(v) => onChange("leadType", v)}
              options={LEAD_TYPES}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Customer Details">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="First Name"
              placeholder="Enter first name"
              value={values.firstName}
              onChange={(v) => onChange("firstName", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Last Name"
              placeholder="Enter last name"
              value={values.lastName}
              onChange={(v) => onChange("lastName", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Email Address"
              type="email"
              placeholder="email@example.com"
              value={values.email}
              onChange={(v) => onChange("email", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Phone Number"
              placeholder="(000) 000-0000"
              value={values.phone}
              onChange={(v) => onChange("phone", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Preferred Contact Method"
              value={values.preferredContactMethod}
              onChange={(v) => onChange("preferredContactMethod", v)}
              options={CONTACT_METHODS}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Company Name"
              placeholder="Optional"
              value={values.companyName}
              onChange={(v) => onChange("companyName", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ToggleField
              label="Existing Client"
              value={values.existingClient}
              onChange={(v) => onChange("existingClient", v)}
            />
          </Grid>
          {values.existingClient && (
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <SelectField
                label="Link to Existing Customer"
                value={values.existingCustomerId}
                onChange={(v) => onChange("existingCustomerId", v)}
                options={EXISTING_CUSTOMERS}
              />
            </Grid>
          )}
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Job Site Details">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Job Site Address"
              placeholder="Street address"
              value={values.jobSiteAddress}
              onChange={(v) => onChange("jobSiteAddress", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="City"
              value={values.jobSiteCity}
              onChange={(v) => onChange("jobSiteCity", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <LabeledSelectField
              label="State"
              value={values.jobSiteState}
              onChange={(v) => onChange("jobSiteState", v)}
              options={ALL_US_STATES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Zip Code"
              placeholder="00000"
              value={values.jobSiteZip}
              onChange={(v) => onChange("jobSiteZip", v.replace(/\D/g, "").slice(0, 5))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Property Type"
              value={values.jobSitePropertyType}
              onChange={(v) => onChange("jobSitePropertyType", v)}
              options={JOB_SITE_PROPERTY_TYPES}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Project Details">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <MultiSelectField
              label="Type of Area"
              value={values.installationTypes}
              onChange={(v) => onChange("installationTypes", v)}
              options={INSTALLATION_TYPES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Approximate Area (sq ft)"
              type="number"
              placeholder="e.g., 1500"
              value={values.approximateArea}
              onChange={(v) => onChange("approximateArea", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Estimated Project Value ($)"
              type="number"
              placeholder="Optional"
              value={values.estimatedProjectValue}
              onChange={(v) => onChange("estimatedProjectValue", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Expected Start Date"
              type="date"
              value={values.expectedStartDate}
              onChange={(v) => onChange("expectedStartDate", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <ToggleField
              label="Site Visit Completed"
              value={values.siteVisitCompleted}
              onChange={(v) => onChange("siteVisitCompleted", v)}
            />
          </Grid>
          {!values.siteVisitCompleted && (
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <TextFieldInput
                label="Site Visit Scheduled Date"
                type="date"
                value={values.siteVisitScheduledDate}
                onChange={(v) => onChange("siteVisitScheduledDate", v)}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Project Description"
              multiline
              minRows={4}
              placeholder="Client requirements and project summary..."
              value={values.projectDescription}
              onChange={(v) => onChange("projectDescription", v)}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Assignment">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Territory / Branch"
              value={values.territoryBranch}
              onChange={(v) => onChange("territoryBranch", v)}
              disabled
              placeholder="Auto-filled from zip code"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Assigned Sales Rep"
              value={values.assignedSalesRep}
              onChange={(v) => onChange("assignedSalesRep", v)}
              options={SALES_REP_NAMES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Follow-up Date"
              type="date"
              value={values.followUpDate}
              onChange={(v) => onChange("followUpDate", v)}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Lead Status">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Lead Status"
              value={values.leadStatus}
              onChange={(v) => onChange("leadStatus", v)}
              options={LEAD_STATUSES}
            />
          </Grid>
          {values.leadStatus === "Lost" && (
            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <SelectField
                label="Lost Reason"
                value={values.lostReason}
                onChange={(v) => onChange("lostReason", v)}
                options={LOST_REASONS}
              />
            </Grid>
          )}
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Priority"
              value={values.priority}
              onChange={(v) => onChange("priority", v)}
              options={PRIORITIES}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Notes & Communication">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Internal Notes"
              multiline
              minRows={4}
              placeholder="Sales rep notes, not visible to client..."
              value={values.internalNotes}
              onChange={(v) => onChange("internalNotes", v)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Communication Log"
              multiline
              minRows={4}
              value={values.communicationLog}
              onChange={(v) => onChange("communicationLog", v)}
              disabled
              placeholder="Calls, emails, SMS, WhatsApp conversations, and activity history will appear here."
            />
          </Grid>
        </Grid>
      </WorkspaceSection>
    </>
  );
}
