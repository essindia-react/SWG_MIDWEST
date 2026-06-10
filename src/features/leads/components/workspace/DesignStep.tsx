import React, { useState } from "react";
import { Grid } from "@mui/material";
import { WorkspaceSection } from "./WorkspaceSection";
import { SelectField, TextFieldInput } from "./workspaceFields";
import { fileToUploadedImage, ImageUploadField } from "./ImageUploadField";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const DESIGN_STATUSES = ["Draft", "In Progress", "Finalized"] as const;

interface DesignStepProps {
  values: WorkspaceFormValues;
  leadNumber: string;
  onChange: WorkspaceFormChange;
}

export function DesignStep({ values, leadNumber, onChange }: DesignStepProps) {
  const [emptySlots, setEmptySlots] = useState(
    Math.max(1, values.designImages.length === 0 ? 1 : 0)
  );

  const totalSlots = values.designImages.length + emptySlots;

  const handleUploadAt = (slotIndex: number, file: File) => {
    const uploaded = fileToUploadedImage(file);
    if (slotIndex < values.designImages.length) {
      const next = [...values.designImages];
      next[slotIndex] = uploaded;
      onChange("designImages", next);
    } else {
      onChange("designImages", [...values.designImages, uploaded]);
      setEmptySlots((n) => Math.max(1, n));
    }
  };

  const handleRemoveAt = (slotIndex: number) => {
    onChange(
      "designImages",
      values.designImages.filter((_, i) => i !== slotIndex)
    );
  };

  return (
    <>
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

      <WorkspaceSection title="Design Images">
        <Grid container spacing={2}>
          {Array.from({ length: totalSlots }).map((_, index) => (
            <Grid key={`design-img-${index}`} size={{ xs: 12, md: 6, lg: 4 }}>
              <ImageUploadField
                label={`Design Image ${index + 1}`}
                image={index < values.designImages.length ? values.designImages[index] : undefined}
                onUpload={(file) => handleUploadAt(index, file)}
                onRemove={
                  index < values.designImages.length
                    ? () => handleRemoveAt(index)
                    : undefined
                }
              />
            </Grid>
          ))}
        </Grid>
      </WorkspaceSection>
    </>
  );
}
