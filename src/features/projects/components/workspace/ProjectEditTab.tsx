import React, { useMemo, useState } from "react";
import { Box, Button, Grid } from "@mui/material";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import {
  getCustomerById,
  PROJECT_CUSTOMERS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  projectStatusFromApi,
  projectStatusToApi,
  TEAM_USERS,
} from "../../constants/projectConstants";
import type { Project, ProjectStatus } from "../../../../types/project";

interface ProjectEditTabProps {
  project: Project;
  onSave: (updates: Partial<Project>) => void;
}

export function ProjectEditTab({ project, onSave }: ProjectEditTabProps) {
  const customerOptions = useMemo(
    () => PROJECT_CUSTOMERS.map((c) => `${c.name} — ${c.code}`),
    []
  );

  const initialCustomerLabel = useMemo(() => {
    const customer = getCustomerById(project.customerId);
    return customer ? `${customer.name} — ${customer.code}` : "";
  }, [project.customerId]);

  const [customerLabel, setCustomerLabel] = useState(initialCustomerLabel);
  const [plannedStartDate, setPlannedStartDate] = useState(project.plannedStartDate);
  const [plannedEndDate, setPlannedEndDate] = useState(project.plannedEndDate);
  const [description, setDescription] = useState(project.description);
  const [projectType, setProjectType] = useState(project.projectType);
  const [actualStartDate, setActualStartDate] = useState(project.actualStartDate);
  const [actualEndDate, setActualEndDate] = useState(project.actualEndDate);
  const [status, setStatus] = useState(projectStatusFromApi(project.status));
  const [projectValue, setProjectValue] = useState(
    project.projectValue ? String(project.projectValue) : ""
  );
  const [projectManager, setProjectManager] = useState(project.projectManager);
  const [remarks, setRemarks] = useState(project.remarks);

  const selectedCustomer = useMemo(() => {
    const match = PROJECT_CUSTOMERS.find(
      (c) => `${c.name} — ${c.code}` === customerLabel
    );
    return match ? getCustomerById(match.id) : undefined;
  }, [customerLabel]);

  const handleSave = () => {
    const customer = PROJECT_CUSTOMERS.find(
      (c) => `${c.name} — ${c.code}` === customerLabel
    );

    onSave({
      customerId: customer?.id ?? project.customerId,
      customerName: customer?.name ?? project.customerName,
      plannedStartDate,
      plannedEndDate,
      description,
      projectType,
      actualStartDate,
      actualEndDate,
      status: projectStatusToApi(status) as ProjectStatus,
      projectValue: Number(projectValue) || 0,
      projectManager,
      remarks,
    });
    toast.success("Project updated");
  };

  return (
    <Box>
      <WorkspaceSection title="Edit Project">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Project Code"
              value={project.projectCode}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Project Date"
              type="date"
              value={project.projectDate}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Customer Name"
              value={customerLabel}
              onChange={setCustomerLabel}
              options={customerOptions}
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
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Project Status"
              value={status}
              onChange={setStatus}
              options={PROJECT_STATUS_OPTIONS}
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
            <TextFieldInput
              label="Project Value"
              value={projectValue}
              onChange={setProjectValue}
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
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" color="primary" startIcon={<Save size={16} />} onClick={handleSave}>
              Save Changes
            </Button>
          </Grid>
        </Grid>
      </WorkspaceSection>
    </Box>
  );
}
