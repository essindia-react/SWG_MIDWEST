import { Box, Button, Grid, Typography } from "@mui/material";
import { FileCheck, FileText } from "lucide-react";
import { WorkspaceSection } from "./WorkspaceSection";
import { SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const PROPOSAL_STATUSES = ["Draft", "Sent", "Accepted", "Rejected"] as const;

interface ProposalStepProps {
  values: WorkspaceFormValues;
  leadNumber: string;
  onChange: WorkspaceFormChange;
}

export function ProposalStep({ values, leadNumber, onChange }: ProposalStepProps) {
  return (
    <>
      <WorkspaceSection title="Proposal Details">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Proposal ID" value={values.proposalId} onChange={(v) => onChange("proposalId", v)} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Lead ID" value={leadNumber} onChange={() => {}} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Design ID" value={values.designId} onChange={() => {}} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Estimation ID" value={values.estimationNo} onChange={() => {}} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Customer Name" value={values.estimationCustomerName} onChange={() => {}} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Proposal Name"
              placeholder="Final Proposal - Scottsdale Residence"
              value={values.proposalName}
              onChange={(v) => onChange("proposalName", v)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField label="Proposal Status" value={values.proposalStatus} onChange={(v) => onChange("proposalStatus", v)} options={PROPOSAL_STATUSES} />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Document Generation">
        <Box
          sx={{
            p: 6,
            border: 2,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            bgcolor: "grey.50",
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              bgcolor: "primary.light",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
              opacity: 0.35,
            }}
          />
          <FileCheck size={32} color="#2E7D32" style={{ marginTop: -52, marginBottom: 16 }} />
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, mb: 1 }}>
            Ready to Generate Proposal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: 360 }}>
            All details from Design and Estimation have been synchronized. You can now generate the final PDF for the customer.
          </Typography>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" color="inherit" sx={{ fontWeight: 600 }}>
              Preview Layout
            </Button>
            <Button variant="contained" color="primary" startIcon={<FileText size={16} />} sx={{ fontWeight: 600, px: 4 }}>
              Generate PDF
            </Button>
          </Box>
        </Box>
      </WorkspaceSection>
    </>
  );
}
