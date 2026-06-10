import React, { useCallback, useMemo, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "../../../../hooks/useProjects";
import { generateProjectCode } from "../../../../lib/projectHelpers";
import {
  getCustomerById,
  getProposalsForCustomer,
  PROJECT_CUSTOMERS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  projectStatusToApi,
  TEAM_USERS,
} from "../../constants/projectConstants";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";

interface ProjectCreateTabProps {
  onCreated: (projectId: string) => void;
  onCancel: () => void;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ProjectCreateTab({ onCreated, onCancel }: ProjectCreateTabProps) {
  const { addProject } = useProjects();
  const [projectCode] = useState(() => generateProjectCode());
  const [projectDate] = useState(() => todayIsoDate());
  const [customerLabel, setCustomerLabel] = useState("");
  const [proposalLabel, setProposalLabel] = useState("");
  const [plannedStartDate, setPlannedStartDate] = useState("");
  const [plannedEndDate, setPlannedEndDate] = useState("");
  const [description, setDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [actualStartDate, setActualStartDate] = useState("");
  const [actualEndDate, setActualEndDate] = useState("");
  const [status, setStatus] = useState("Planning");
  const [projectValue, setProjectValue] = useState("");
  const [projectManager, setProjectManager] = useState("");
  const [remarks, setRemarks] = useState("");

  const customerOptions = useMemo(
    () => PROJECT_CUSTOMERS.map((c) => `${c.name} — ${c.code}`),
    []
  );

  const selectedCustomer = useMemo(() => {
    const match = PROJECT_CUSTOMERS.find(
      (c) => `${c.name} — ${c.code}` === customerLabel
    );
    return match ? getCustomerById(match.id) : undefined;
  }, [customerLabel]);

  const proposalOptions = useMemo(() => {
    if (!selectedCustomer) return [];
    return getProposalsForCustomer(selectedCustomer.id).map(
      (p) => `${p.id} — ${p.name}`
    );
  }, [selectedCustomer]);

  const selectedProposal = useMemo(() => {
    if (!selectedCustomer || !proposalLabel) return undefined;
    const proposalId = proposalLabel.split(" — ")[0];
    return getProposalsForCustomer(selectedCustomer.id).find((p) => p.id === proposalId);
  }, [selectedCustomer, proposalLabel]);

  const handleSubmit = useCallback(() => {
    if (!customerLabel || !plannedStartDate || !projectType || !projectManager) {
      toast.error("Please fill Customer, Planned Start Date, Project Type, and Project Manager");
      return;
    }

    const customer = PROJECT_CUSTOMERS.find(
      (c) => `${c.name} — ${c.code}` === customerLabel
    );
    if (!customer) return;

    const newProject = addProject({
      customerId: customer.id,
      customerName: customer.name,
      proposalId: selectedProposal?.id,
      proposalName: selectedProposal?.name,
      plannedStartDate,
      plannedEndDate,
      description,
      projectType,
      actualStartDate,
      actualEndDate,
      status: projectStatusToApi(status) as "planning",
      projectValue: Number(projectValue) || 0,
      projectManager,
      remarks,
      teamAssignments: [],
      milestones: [],
    });

    toast.success(`Project ${newProject.projectCode} created`);
    onCreated(newProject.id);
  }, [
    addProject,
    customerLabel,
    selectedProposal,
    plannedStartDate,
    plannedEndDate,
    description,
    projectType,
    actualStartDate,
    actualEndDate,
    status,
    projectValue,
    projectManager,
    remarks,
    onCreated,
  ]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <WorkspaceSection title="Project Creation">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Project Code"
              value={projectCode}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Project Date"
              type="date"
              value={projectDate}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Customer Name"
              value={customerLabel}
              onChange={(value) => {
                setCustomerLabel(value);
                setProposalLabel("");
              }}
              options={customerOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Proposal"
              value={proposalLabel}
              onChange={setProposalLabel}
              options={proposalOptions}
              disabled={!selectedCustomer}
            />
          </Grid>

          {selectedCustomer && (
            <>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <TextFieldInput
                  label="Customer Email"
                  value={selectedCustomer.email}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 4 }}>
                <TextFieldInput
                  label="Customer Phone"
                  value={selectedCustomer.phone}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, md: 12, lg: 4 }}>
                <TextFieldInput
                  label="Customer Address"
                  value={selectedCustomer.address}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Planned Start Date"
              type="date"
              value={plannedStartDate}
              onChange={setPlannedStartDate}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Planned End Date"
              type="date"
              value={plannedEndDate}
              onChange={setPlannedEndDate}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Project Type"
              value={projectType}
              onChange={setProjectType}
              options={PROJECT_TYPE_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Project Description"
              value={description}
              onChange={setDescription}
              multiline
              minRows={3}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Actual Start Date"
              type="date"
              value={actualStartDate}
              onChange={setActualStartDate}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Actual End Date"
              type="date"
              value={actualEndDate}
              onChange={setActualEndDate}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Project Status"
              value={status}
              onChange={setStatus}
              options={PROJECT_STATUS_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Project Value"
              value={projectValue}
              onChange={setProjectValue}
              placeholder="Auto complete"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Project Manager"
              value={projectManager}
              onChange={setProjectManager}
              options={TEAM_USERS.map((u) => u.name)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Remarks/Notes"
              value={remarks}
              onChange={setRemarks}
              multiline
              minRows={2}
            />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: 1.5,
          pt: 1,
        }}
      >
        <Button variant="outlined" color="inherit" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          endIcon={<CheckCircle size={16} />}
          onClick={handleSubmit}
        >
          Create Project
        </Button>
      </Box>
    </Box>
  );
}
