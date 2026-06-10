import React, { useState } from "react";
import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Typography } from "@mui/material";
import { FileCheck, FileText, X } from "lucide-react";
import proposalTemplateUrl from "../../../../assets/SWG_Proposal_Template.pdf";
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
  const [previewOpen, setPreviewOpen] = useState(false);

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
            <Button
              variant="outlined"
              color="inherit"
              sx={{ fontWeight: 600 }}
              onClick={() => setPreviewOpen(true)}
            >
              Preview Layout
            </Button>
            <Button variant="contained" color="primary" startIcon={<FileText size={16} />} sx={{ fontWeight: 600, px: 4 }}>
              Generate PDF
            </Button>
          </Box>
        </Box>
      </WorkspaceSection>

      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "90vw",
            height: "92vh",
            maxWidth: "1400px",
          },
        }}
      >
        {/* <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontWeight: 700,
            padding: "6px 14px",
          }}
        >
          Proposal Preview
          <IconButton onClick={() => setPreviewOpen(false)} size="small" aria-label="Close preview">
            <X size={18} />
          </IconButton>
        </DialogTitle> */}
        <DialogContent dividers sx={{ p: 0, height: "80vh" }}>
          <Box
            component="iframe"
            src={proposalTemplateUrl}
            title="SWG Proposal Template"
            sx={{ width: "100%", height: "100%", border: "none", display: "block" }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
