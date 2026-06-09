import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { ArrowLeft, CheckCircle, X } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "../../../hooks/useProjects";
import { generateProjectCode, getDefaultProjectDocuments } from "../../../lib/projectHelpers";
import { theme } from "../../../theme/theme";
import type {
  MilestoneFormInput,
  Project,
  ProjectMilestone,
  ProjectTaskFormInput,
  TeamAssignmentFormInput,
} from "../../../types/project";
import {
  getCustomerById,
  getProposalsForCustomer,
  PROJECT_CUSTOMERS,
  PROJECT_STATUS_OPTIONS,
  PROJECT_TYPE_OPTIONS,
  projectStatusToApi,
  TEAM_USERS,
} from "../constants/projectConstants";
import {
  SelectField,
  TextFieldInput,
} from "../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../leads/components/workspace/WorkspaceSection";
import { AssignTeamsTab } from "./workspace/AssignTeamsTab";
import { MilestonesTab } from "./workspace/MilestonesTab";

interface ProjectCreateWorkspaceProps {
  onBack: () => void;
  onCreated?: (projectId: string) => void;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function ProjectCreateWorkspace({ onBack, onCreated }: ProjectCreateWorkspaceProps) {
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
  const [teamAssignments, setTeamAssignments] = useState<Project["teamAssignments"]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);

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

  const draftProject = useMemo((): Project => {
    const customer = PROJECT_CUSTOMERS.find(
      (c) => `${c.name} — ${c.code}` === customerLabel
    );

    return {
      id: "draft-project",
      projectCode,
      projectDate,
      customerId: customer?.id ?? "",
      customerName: customer?.name ?? "",
      proposalId: selectedProposal?.id,
      proposalName: selectedProposal?.name,
      plannedStartDate,
      plannedEndDate,
      description,
      projectType,
      actualStartDate,
      actualEndDate,
      status: projectStatusToApi(status) as Project["status"],
      projectValue: Number(projectValue) || 0,
      projectManager,
      remarks,
      teamAssignments,
      milestones,
      documents: getDefaultProjectDocuments(),
      budget: { materials: [], crew: [], equipment: [], overhead: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }, [
    customerLabel,
    selectedProposal,
    projectCode,
    projectDate,
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
    teamAssignments,
    milestones,
  ]);

  const handleAddTeamAssignment = useCallback((input: TeamAssignmentFormInput) => {
    setTeamAssignments((prev) => [...prev, { id: `team-draft-${Date.now()}`, ...input }]);
  }, []);

  const handleUpdateTeamAssignment = useCallback(
    (assignmentId: string, updates: Partial<TeamAssignmentFormInput>) => {
      setTeamAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId ? { ...assignment, ...updates } : assignment
        )
      );
    },
    []
  );

  const handleRemoveTeamAssignment = useCallback((assignmentId: string) => {
    setTeamAssignments((prev) => prev.filter((assignment) => assignment.id !== assignmentId));
  }, []);

  const handleAddMilestone = useCallback((input: MilestoneFormInput) => {
    setMilestones((prev) => [
      ...prev,
      { id: `ms-draft-${Date.now()}`, ...input, tasks: [] },
    ]);
  }, []);

  const handleUpdateMilestone = useCallback(
    (milestoneId: string, updates: Partial<MilestoneFormInput>) => {
      setMilestones((prev) =>
        prev.map((milestone) =>
          milestone.id === milestoneId ? { ...milestone, ...updates } : milestone
        )
      );
    },
    []
  );

  const handleRemoveMilestone = useCallback((milestoneId: string) => {
    setMilestones((prev) => prev.filter((milestone) => milestone.id !== milestoneId));
  }, []);

  const handleAddTask = useCallback((input: ProjectTaskFormInput) => {
    setMilestones((prev) =>
      prev.map((milestone) => {
        if (milestone.id !== input.milestoneId) return milestone;
        const { milestoneId, ...taskFields } = input;
        return {
          ...milestone,
          tasks: [
            ...milestone.tasks,
            {
              id: `task-draft-${Date.now()}`,
              milestoneId,
              ...taskFields,
            },
          ],
        };
      })
    );
  }, []);

  const handleUpdateTask = useCallback(
    (
      milestoneId: string,
      taskId: string,
      updates: Partial<Omit<ProjectTaskFormInput, "milestoneId">>
    ) => {
      setMilestones((prev) =>
        prev.map((milestone) => {
          if (milestone.id !== milestoneId) return milestone;
          return {
            ...milestone,
            tasks: milestone.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          };
        })
      );
    },
    []
  );

  const handleRemoveTask = useCallback((milestoneId: string, taskId: string) => {
    setMilestones((prev) =>
      prev.map((milestone) => {
        if (milestone.id !== milestoneId) return milestone;
        return {
          ...milestone,
          tasks: milestone.tasks.filter((task) => task.id !== taskId),
        };
      })
    );
  }, []);

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
      teamAssignments: teamAssignments.map(
        ({ userId, userName, role, startDate, endDate }) => ({
          userId,
          userName,
          role,
          startDate,
          endDate,
        })
      ),
      milestones: milestones.map(
        ({
          name,
          description: milestoneDescription,
          assignedTo,
          plannedStartDate: milestoneStart,
          plannedEndDate: milestoneEnd,
          estimateEffortHrs,
          status: milestoneStatus,
          tasks,
        }) => ({
          name,
          description: milestoneDescription,
          assignedTo,
          plannedStartDate: milestoneStart,
          plannedEndDate: milestoneEnd,
          estimateEffortHrs,
          status: milestoneStatus,
          tasks: tasks.map(
            ({
              name: taskName,
              estimateEffortHrs: taskEffort,
              plannedStartDate: taskStart,
              plannedEndDate: taskEnd,
              assignedTo: taskAssignee,
              status: taskStatus,
            }) => ({
              name: taskName,
              estimateEffortHrs: taskEffort,
              plannedStartDate: taskStart,
              plannedEndDate: taskEnd,
              assignedTo: taskAssignee,
              status: taskStatus,
            })
          ),
        })
      ),
    });

    toast.success(`Project ${newProject.projectCode} created`);
    if (onCreated) {
      onCreated(newProject.id);
    } else {
      onBack();
    }
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
    teamAssignments,
    milestones,
    onBack,
    onCreated,
  ]);

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: "divider",
            flexShrink: 0,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <IconButton onClick={onBack} size="small">
              <ArrowLeft size={20} />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
              Create New Project
            </Typography>
          </Box>
          <IconButton onClick={onBack} size="small">
            <X size={20} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: "auto", p: 4 }}>
          <Box sx={{ maxWidth: 960, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
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

            <AssignTeamsTab
              project={draftProject}
              onAddAssignment={handleAddTeamAssignment}
              onUpdateAssignment={handleUpdateTeamAssignment}
              onRemoveAssignment={handleRemoveTeamAssignment}
            />

            <MilestonesTab
              project={draftProject}
              onAddMilestone={handleAddMilestone}
              onUpdateMilestone={handleUpdateMilestone}
              onRemoveMilestone={handleRemoveMilestone}
              onAddTask={handleAddTask}
              onUpdateTask={handleUpdateTask}
              onRemoveTask={handleRemoveTask}
            />
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            px: 4,
            py: 2,
            borderTop: 1,
            borderColor: "divider",
            gap: 1.5,
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onBack}>
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
    </ThemeProvider>
  );
}
