import { Grid } from "@mui/material";
import { WorkspaceSection } from "./WorkspaceSection";
import { SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const DESIGN_STATUSES = ["Draft", "In Progress", "Finalized"] as const;

interface DesignStepProps {
  values: WorkspaceFormValues;
  leadNumber: string;
  onChange: WorkspaceFormChange;
}

export function DesignStep({ values, leadNumber, onChange }: DesignStepProps) {
  return (
    <WorkspaceSection title="Design Details">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TextFieldInput label="Design ID" value={values.designId} onChange={(v) => onChange("designId", v)} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TextFieldInput label="Lead ID" value={leadNumber} onChange={() => {}} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TextFieldInput label="Design Name" placeholder="Henderson Backyard Design" value={values.designName} onChange={(v) => onChange("designName", v)} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <SelectField label="Design Status" value={values.designStatus} onChange={(v) => onChange("designStatus", v)} options={DESIGN_STATUSES} />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TextFieldInput label="Created By" value={values.designCreatedBy} onChange={(v) => onChange("designCreatedBy", v)} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TextFieldInput label="Created Date" value={values.designCreatedDate} onChange={(v) => onChange("designCreatedDate", v)} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <TextFieldInput label="Last Updated" value={values.designLastUpdated} onChange={(v) => onChange("designLastUpdated", v)} disabled />
        </Grid>
      </Grid>
    </WorkspaceSection>
  );
}
