import { Box, Button, Grid, Typography } from "@mui/material";
import { MessageCircle, Plus } from "lucide-react";
import { WorkspaceSection } from "./WorkspaceSection";
import { SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const PROPOSAL_REFS = ["PRP-9902", "PRP-9901"] as const;
const STATUS_UPDATES = ["Decision Pending", "Following Up", "Contract Signed"] as const;

const ACTIVITY_HISTORY = [
  {
    title: "Called to discuss pricing",
    date: "Jun 04, 2026",
    desc: "Customer was happy with the design but asked for a 5% discount on the premium turf.",
  },
  {
    title: "Email sent with final proposal",
    date: "Jun 03, 2026",
    desc: "Sent the PRP-9902 document for electronic signature.",
  },
];

interface FollowUpStepProps {
  values: WorkspaceFormValues;
  onChange: WorkspaceFormChange;
}

export function FollowUpStep({ values, onChange }: FollowUpStepProps) {
  return (
    <>
      <WorkspaceSection title="Log Activity">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextFieldInput label="Customer Name" value={values.followUpCustomerName} onChange={(v) => onChange("followUpCustomerName", v)} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField label="Proposal Ref" value={values.proposalRef} onChange={(v) => onChange("proposalRef", v)} options={PROPOSAL_REFS} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <SelectField label="Status Update" value={values.statusUpdate} onChange={(v) => onChange("statusUpdate", v)} options={STATUS_UPDATES} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextFieldInput label="Next Follow Up Date" type="date" value={values.nextFollowUpDate} onChange={(v) => onChange("nextFollowUpDate", v)} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Remarks"
              multiline
              minRows={3}
              placeholder="Summary of conversation..."
              value={values.remarks}
              onChange={(v) => onChange("remarks", v)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              startIcon={<Plus size={16} />}
              sx={{ bgcolor: "#1E293B", "&:hover": { bgcolor: "#0F172A" }, fontWeight: 600, fontSize: "0.8125rem" }}
            >
              Add to Log
            </Button>
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Activity History">
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {ACTIVITY_HISTORY.map((item) => (
            <Box
              key={item.title}
              sx={{
                p: 2,
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                bgcolor: "background.paper",
                "&:hover": { boxShadow: 2 },
                transition: "box-shadow 0.2s",
              }}
            >
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: "grey.100" }}>
                  <MessageCircle size={20} color="#475569" />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>{item.title}</Typography>
                    <Typography
                      component="span"
                      sx={{
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: "grey.100",
                        color: "text.secondary",
                      }}
                    >
                      {item.date}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {item.desc}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </WorkspaceSection>
    </>
  );
}
