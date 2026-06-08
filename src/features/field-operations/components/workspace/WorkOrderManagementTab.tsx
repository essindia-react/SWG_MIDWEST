import React, { useMemo } from "react";
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Download, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { formatProjectDate } from "../../../../lib/projectHelpers";
import { TextFieldInput } from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import type { FieldOperations, Project } from "../../../../types/project";
import {
  getCrewLeader,
  getCrewMembers,
  getJobSiteAddress,
} from "../../lib/fieldOperationsHelpers";
import { MilestonesTasksSection } from "./MilestonesTasksSection";

interface WorkOrderManagementTabProps {
  project: Project;
  fieldOps: FieldOperations;
  onFieldOpsChange: (updates: Partial<FieldOperations>) => void;
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>{value}</Typography>
    </Box>
  );
}

export function WorkOrderManagementTab({
  project,
  fieldOps,
  onFieldOpsChange,
}: WorkOrderManagementTabProps) {
  const crewLeader = useMemo(() => getCrewLeader(project), [project]);
  const crewMembers = useMemo(() => getCrewMembers(project), [project]);
  const jobSiteAddress = useMemo(() => getJobSiteAddress(project), [project]);

  const handlePrintDownload = () => {
    toast.success("Work order PDF exported successfully");
  };

  const handleSendToCrewLeader = () => {
    onFieldOpsChange({
      sentToCrewLeader: true,
      sentToCrewLeaderAt: new Date().toISOString(),
    });
    toast.success(`Work order sent to ${crewLeader} on mobile app successfully`);
  };

  return (
    <Box>
      <WorkspaceSection title="Work Order Details">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadOnlyField label="Work Order #" value={fieldOps.workOrderNumber} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadOnlyField
              label="Project Name & Code"
              value={`${project.customerName} (${project.projectCode})`}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadOnlyField label="Customer Name" value={project.customerName} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadOnlyField label="Job Site Address" value={jobSiteAddress} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadOnlyField
              label="Planned Start Date"
              value={formatProjectDate(project.plannedStartDate)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <ReadOnlyField label="Crew Leader" value={crewLeader} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <ReadOnlyField
              label="Crew Members"
              value={crewMembers.length > 0 ? crewMembers.join(", ") : "Not assigned"}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Special Instructions"
              value={fieldOps.specialInstructions}
              onChange={(value) => onFieldOpsChange({ specialInstructions: value })}
              multiline
              minRows={3}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Milestones & Tasks">
        <MilestonesTasksSection project={project} />
      </WorkspaceSection>

      <WorkspaceSection title="Equipment Required">
        {project.budget.equipment.length === 0 ? (
          <Typography sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}>
            No equipment in budget.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Equipment</TableCell>
                <TableCell>Usage Days</TableCell>
                <TableCell>Daily Rate</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {project.budget.equipment.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.equipmentName}</TableCell>
                  <TableCell>{item.usageDays}</TableCell>
                  <TableCell>${item.dailyRate}</TableCell>
                  <TableCell>{item.notes || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </WorkspaceSection>

      <WorkspaceSection title="Materials Required (Pick List Preview)">
        {project.budget.materials.length === 0 ? (
          <Typography sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}>
            No materials in budget.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>SKU</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Unit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {project.budget.materials.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.materialName}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.estimatedQuantity}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </WorkspaceSection>

      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Button
          variant="outlined"
          startIcon={<Download size={16} />}
          onClick={handlePrintDownload}
        >
          Print / Download PDF
        </Button>
        <Button
          variant="contained"
          startIcon={<Send size={16} />}
          onClick={handleSendToCrewLeader}
          disabled={fieldOps.sentToCrewLeader}
        >
          {fieldOps.sentToCrewLeader ? "Sent to Crew Leader" : "Send to Crew Leader"}
        </Button>
        {fieldOps.sentToCrewLeader && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Smartphone size={16} color="#2E7D32" />
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              Pushed to mobile app
              {fieldOps.sentToCrewLeaderAt
                ? ` · ${formatProjectDate(fieldOps.sentToCrewLeaderAt.slice(0, 10))}`
                : ""}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}
