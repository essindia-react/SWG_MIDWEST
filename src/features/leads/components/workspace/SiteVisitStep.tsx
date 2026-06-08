import { Grid } from "@mui/material";
import { WorkspaceSection } from "./WorkspaceSection";
import { CheckboxCard, RadioField, SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const VISIT_STATUSES = ["Scheduled", "Completed", "Cancelled"] as const;
const SURFACE_TYPES = ["Dirt", "Grass", "Concrete", "Other"] as const;
const TERRAINS = ["Flat", "Sloped", "Uneven"] as const;
const DRAINAGE = ["Good", "Fair", "Poor"] as const;
const SERVICE_TYPES = ["Premium Turf", "K9 Turf", "Putting Green"] as const;
const BUDGET_RANGES = ["$5k-$10k", "$10k-$25k", "$25k-$50k", "$50k+"] as const;

interface SiteVisitStepProps {
  values: WorkspaceFormValues;
  onChange: WorkspaceFormChange;
}

export function SiteVisitStep({ values, onChange }: SiteVisitStepProps) {
  return (
    <>
      <WorkspaceSection title="Visit Info">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput label="Visit Date" type="date" value={values.visitDate} onChange={(v) => onChange("visitDate", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput label="Visit Time" type="time" value={values.visitTime} onChange={(v) => onChange("visitTime", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput label="Surveyed By" placeholder="Name of surveyor" value={values.surveyedBy} onChange={(v) => onChange("surveyedBy", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField label="Visit Status" value={values.visitStatus} onChange={(v) => onChange("visitStatus", v)} options={VISIT_STATUSES} />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Location">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput label="Address" placeholder="Site address" value={values.siteAddress} onChange={(v) => onChange("siteAddress", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="City" placeholder="City" value={values.siteCity} onChange={(v) => onChange("siteCity", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="ZIP" placeholder="ZIP Code" value={values.siteZip} onChange={(v) => onChange("siteZip", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Total Area (sq ft)" type="number" value={values.totalArea} onChange={(v) => onChange("totalArea", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Length (ft)" type="number" value={values.length} onChange={(v) => onChange("length", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Width (ft)" type="number" value={values.width} onChange={(v) => onChange("width", v)} />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Conditions">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField label="Surface Type" value={values.surfaceType} onChange={(v) => onChange("surfaceType", v)} options={SURFACE_TYPES} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField label="Terrain" value={values.terrain} onChange={(v) => onChange("terrain", v)} options={TERRAINS} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField label="Drainage" value={values.drainage} onChange={(v) => onChange("drainage", v)} options={DRAINAGE} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <RadioField
              label="Irrigation Present"
              name="irrigationPresent"
              value={values.irrigationPresent}
              onChange={(v) => onChange("irrigationPresent", v)}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <RadioField
              label="Equipment Access"
              name="equipmentAccess"
              value={values.equipmentAccess}
              onChange={(v) => onChange("equipmentAccess", v)}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField label="Service Type" value={values.serviceType} onChange={(v) => onChange("serviceType", v)} options={SERVICE_TYPES} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField label="Budget Range" value={values.budgetRange} onChange={(v) => onChange("budgetRange", v)} options={BUDGET_RANGES} />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Obstacles">
        <Grid container spacing={2}>
          <CheckboxCard label="Trees" checked={values.obstacleTrees} onChange={(v) => onChange("obstacleTrees", v)} />
          <CheckboxCard label="Fence" checked={values.obstacleFence} onChange={(v) => onChange("obstacleFence", v)} />
          <CheckboxCard label="Pool" checked={values.obstaclePool} onChange={(v) => onChange("obstaclePool", v)} />
          <CheckboxCard label="Existing Landscaping" checked={values.obstacleLandscaping} onChange={(v) => onChange("obstacleLandscaping", v)} />
        </Grid>
      </WorkspaceSection>
    </>
  );
}
