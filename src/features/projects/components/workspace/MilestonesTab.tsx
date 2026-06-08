import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ChevronDown, ChevronRight, Edit2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import {
  MILESTONE_STATUS_OPTIONS,
  milestoneStatusFromApi,
  milestoneStatusToApi,
  TASK_STATUS_OPTIONS,
  taskStatusFromApi,
  taskStatusToApi,
  TEAM_USERS,
} from "../../constants/projectConstants";
import type { Project, ProjectMilestone, ProjectTask } from "../../../../types/project";
import { getProjectStatusConfig } from "../../../../lib/projectHelpers";

interface MilestonesTabProps {
  project: Project;
  focusMilestoneId?: string;
  focusTaskId?: string;
  onFocusHandled?: () => void;
  onAddMilestone: (input: {
    name: string;
    description: string;
    assignedTo: string;
    plannedStartDate: string;
    plannedEndDate: string;
    estimateEffortHrs: number;
    status: "completed" | "in-progress" | "on-hold";
  }) => void;
  onUpdateMilestone: (
    milestoneId: string,
    updates: {
      name?: string;
      description?: string;
      assignedTo?: string;
      plannedStartDate?: string;
      plannedEndDate?: string;
      estimateEffortHrs?: number;
      status?: "completed" | "in-progress" | "on-hold";
    }
  ) => void;
  onRemoveMilestone: (milestoneId: string) => void;
  onAddTask: (input: {
    milestoneId: string;
    name: string;
    estimateEffortHrs: number;
    plannedStartDate: string;
    plannedEndDate: string;
    assignedTo: string;
    status: "not-started" | "in-progress" | "completed" | "on-hold";
  }) => void;
  onUpdateTask: (
    milestoneId: string,
    taskId: string,
    updates: {
      name?: string;
      estimateEffortHrs?: number;
      plannedStartDate?: string;
      plannedEndDate?: string;
      assignedTo?: string;
      status?: "not-started" | "in-progress" | "completed" | "on-hold";
    }
  ) => void;
  onRemoveTask: (milestoneId: string, taskId: string) => void;
}

const EMPTY_MILESTONE = {
  name: "",
  description: "",
  assignedTo: "",
  plannedStartDate: "",
  plannedEndDate: "",
  estimateEffortHrs: "",
  status: "In Progress",
};

const EMPTY_TASK = {
  name: "",
  estimateEffortHrs: "",
  plannedStartDate: "",
  plannedEndDate: "",
  assignedTo: "",
  status: "Not Started",
};

function MilestoneStatusChip({ status }: { status: string }) {
  const config = getProjectStatusConfig(
    status as "completed" | "in-progress" | "on-hold" | "planning"
  );
  return (
    <Box
      component="span"
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 999,
        fontSize: "0.75rem",
        fontWeight: 600,
        bgcolor: config.bg,
        color: config.color,
      }}
    >
      {milestoneStatusFromApi(status)}
    </Box>
  );
}

export function MilestonesTab({
  project,
  focusMilestoneId,
  focusTaskId,
  onFocusHandled,
  onAddMilestone,
  onUpdateMilestone,
  onRemoveMilestone,
  onAddTask,
  onUpdateTask,
  onRemoveTask,
}: MilestonesTabProps) {
  const { requestConfirm, confirmDialog } = useConfirmDialog();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [highlightTaskId, setHighlightTaskId] = useState<string | null>(null);
  const taskRefs = useRef<Record<string, HTMLTableRowElement | null>>({});
  const milestoneRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [milestoneForm, setMilestoneForm] = useState(EMPTY_MILESTONE);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState<"create" | "edit">("create");
  const [activeMilestone, setActiveMilestone] = useState<ProjectMilestone | null>(null);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);

  const teamAssigneeOptions =
    project.teamAssignments.length > 0
      ? project.teamAssignments.map((a) => a.userName)
      : TEAM_USERS.map((u) => u.name);

  useEffect(() => {
    if (!focusMilestoneId) return;

    setExpandedId(focusMilestoneId);
    if (focusTaskId) {
      setHighlightTaskId(focusTaskId);
    }

    const scrollTimer = window.setTimeout(() => {
      if (focusTaskId && taskRefs.current[focusTaskId]) {
        taskRefs.current[focusTaskId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (milestoneRefs.current[focusMilestoneId]) {
        milestoneRefs.current[focusMilestoneId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
      onFocusHandled?.();
    }, 350);

    const highlightTimer = window.setTimeout(() => setHighlightTaskId(null), 2500);

    return () => {
      window.clearTimeout(scrollTimer);
      window.clearTimeout(highlightTimer);
    };
  }, [focusMilestoneId, focusTaskId, onFocusHandled]);

  const handleCreateMilestone = () => {
    if (!milestoneForm.name || !milestoneForm.plannedStartDate) {
      toast.error("Please fill Milestone Name and Planned Start Date");
      return;
    }
    const payload = {
      name: milestoneForm.name,
      description: milestoneForm.description,
      assignedTo: milestoneForm.assignedTo,
      plannedStartDate: milestoneForm.plannedStartDate,
      plannedEndDate: milestoneForm.plannedEndDate,
      estimateEffortHrs: Number(milestoneForm.estimateEffortHrs) || 0,
      status: milestoneStatusToApi(milestoneForm.status) as
        | "completed"
        | "in-progress"
        | "on-hold",
    };

    if (editingMilestoneId) {
      onUpdateMilestone(editingMilestoneId, payload);
      toast.success("Milestone updated");
    } else {
      onAddMilestone(payload);
      toast.success("Milestone created");
    }

    setMilestoneForm(EMPTY_MILESTONE);
    setEditingMilestoneId(null);
    setShowCreateForm(false);
  };

  const openEditMilestone = (milestone: ProjectMilestone) => {
    setEditingMilestoneId(milestone.id);
    setMilestoneForm({
      name: milestone.name,
      description: milestone.description,
      assignedTo: milestone.assignedTo,
      plannedStartDate: milestone.plannedStartDate,
      plannedEndDate: milestone.plannedEndDate,
      estimateEffortHrs: String(milestone.estimateEffortHrs || ""),
      status: milestoneStatusFromApi(milestone.status),
    });
    setShowCreateForm(true);
  };

  const closeMilestoneForm = () => {
    setShowCreateForm(false);
    setEditingMilestoneId(null);
    setMilestoneForm(EMPTY_MILESTONE);
  };

  const openTaskModal = (milestone: ProjectMilestone, task?: ProjectTask) => {
    setActiveMilestone(milestone);
    if (task) {
      setTaskModalMode("edit");
      setEditingTask(task);
      setTaskForm({
        name: task.name,
        estimateEffortHrs: String(task.estimateEffortHrs || ""),
        plannedStartDate: task.plannedStartDate,
        plannedEndDate: task.plannedEndDate,
        assignedTo: task.assignedTo,
        status: taskStatusFromApi(task.status),
      });
    } else {
      setTaskModalMode("create");
      setEditingTask(null);
      setTaskForm(EMPTY_TASK);
    }
    setTaskModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!activeMilestone || !taskForm.name) {
      toast.error("Please fill Task Name");
      return;
    }
    const payload = {
      name: taskForm.name,
      estimateEffortHrs: Number(taskForm.estimateEffortHrs) || 0,
      plannedStartDate: taskForm.plannedStartDate,
      plannedEndDate: taskForm.plannedEndDate,
      assignedTo: taskForm.assignedTo,
      status: taskStatusToApi(taskForm.status) as
        | "not-started"
        | "in-progress"
        | "completed"
        | "on-hold",
    };

    if (taskModalMode === "edit" && editingTask) {
      onUpdateTask(activeMilestone.id, editingTask.id, payload);
      toast.success("Task updated");
    } else {
      onAddTask({ milestoneId: activeMilestone.id, ...payload });
      toast.success("Task added");
    }

    setTaskModalOpen(false);
    setActiveMilestone(null);
    setEditingTask(null);
  };

  const toggleMilestone = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>Project Milestones</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Plus size={16} />}
          onClick={() => {
            setEditingMilestoneId(null);
            setMilestoneForm(EMPTY_MILESTONE);
            setShowCreateForm((v) => !v);
          }}
        >
          Create Milestone
        </Button>
      </Box>

      <Collapse in={showCreateForm} unmountOnExit>
        <Box
          sx={{
            position: "relative",
            zIndex: 2,
            mb: 3,
            p: 3,
            borderRadius: 2,
            border: 1,
            borderColor: "primary.main",
            bgcolor: "background.paper",
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>
              {editingMilestoneId ? "Edit Milestone" : "New Milestone"}
            </Typography>
            <IconButton size="small" onClick={closeMilestoneForm}>
              <X size={18} />
            </IconButton>
          </Box>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldInput
                label="Project Name"
                value={project.customerName ? `${project.projectCode} — ${project.customerName}` : project.projectCode}
                onChange={() => {}}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextFieldInput
                label="Milestone Name"
                value={milestoneForm.name}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, name: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Milestone Description"
                value={milestoneForm.description}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, description: v }))}
                multiline
                minRows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <SelectField
                label="Assigned To"
                value={milestoneForm.assignedTo}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, assignedTo: v }))}
                options={teamAssigneeOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <TextFieldInput
                label="Planned Start Date"
                type="date"
                value={milestoneForm.plannedStartDate}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, plannedStartDate: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <TextFieldInput
                label="Planned End Date"
                type="date"
                value={milestoneForm.plannedEndDate}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, plannedEndDate: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <TextFieldInput
                label="Estimate Effort Hrs"
                value={milestoneForm.estimateEffortHrs}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, estimateEffortHrs: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6, lg: 3 }}>
              <SelectField
                label="Status"
                value={milestoneForm.status}
                onChange={(v) => setMilestoneForm((p) => ({ ...p, status: v }))}
                options={MILESTONE_STATUS_OPTIONS}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button variant="contained" color="primary" onClick={handleCreateMilestone}>
                {editingMilestoneId ? "Update Milestone" : "Save Milestone"}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Collapse>

      {project.milestones.length === 0 ? (
        <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          No milestones yet. Click Create Milestone to add one.
        </Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {project.milestones.map((milestone) => {
            const isExpanded = expandedId === milestone.id;
            return (
              <Box
                key={milestone.id}
                ref={(el) => {
                  milestoneRefs.current[milestone.id] = el;
                }}
                sx={{
                  border: 1,
                  borderColor:
                    isExpanded || focusMilestoneId === milestone.id
                      ? "primary.main"
                      : "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: "background.paper",
                  transition: "border-color 0.2s",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    px: 2.5,
                    py: 2,
                    borderBottom: isExpanded ? 1 : 0,
                    borderColor: "divider",
                  }}
                >
                  <Box
                    component="button"
                    type="button"
                    onClick={() => toggleMilestone(milestone.id)}
                    sx={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      border: "none",
                      bgcolor: isExpanded ? "rgba(46,125,50,0.04)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      p: 0,
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} color="#2E7D32" />
                    ) : (
                      <ChevronRight size={18} color="#64748B" />
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.9375rem" }}>
                        {milestone.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}
                        noWrap
                      >
                        {milestone.description || "No description"}
                      </Typography>
                    </Box>
                    <MilestoneStatusChip status={milestone.status} />
                    <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", minWidth: 80 }}>
                      {milestone.tasks.length} tasks
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    onClick={() => openEditMilestone(milestone)}
                    aria-label="Edit milestone"
                  >
                    <Edit2 size={16} color="#2E7D32" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      requestConfirm({
                        title: "Delete Milestone?",
                        description: `Are you sure you want to delete "${milestone.name}" and all its tasks? This action cannot be undone.`,
                        confirmLabel: "Delete",
                        onConfirm: () => {
                          onRemoveMilestone(milestone.id);
                          toast.success("Milestone removed");
                        },
                      })
                    }
                    aria-label="Delete milestone"
                  >
                    <Trash2 size={16} color="#DC2626" />
                  </IconButton>
                </Box>

                <Collapse in={isExpanded} unmountOnExit>
                  <Box sx={{ px: 2.5, pb: 2.5, borderTop: 1, borderColor: "divider" }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        py: 2,
                      }}
                    >
                      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Tasks — {milestone.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Plus size={14} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskModal(milestone);
                        }}
                      >
                        Add Task
                      </Button>
                    </Box>

                    {milestone.tasks.length === 0 ? (
                      <Typography color="text.secondary" sx={{ fontSize: "0.8125rem", pb: 1 }}>
                        No tasks yet.
                      </Typography>
                    ) : (
                      <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1.5, overflow: "hidden" }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "grey.50" }}>
                              <TableCell sx={{ fontWeight: 600 }}>Task Name</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Assigned To</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Effort Hrs</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Start</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>End</TableCell>
                              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                              <TableCell sx={{ fontWeight: 600, width: 88 }} />
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {milestone.tasks.map((task) => (
                              <TableRow
                                key={task.id}
                                hover
                                ref={(el) => {
                                  taskRefs.current[task.id] = el;
                                }}
                                sx={{
                                  bgcolor:
                                    highlightTaskId === task.id
                                      ? "rgba(46,125,50,0.12)"
                                      : undefined,
                                  transition: "background-color 0.3s",
                                }}
                              >
                                <TableCell>{task.name}</TableCell>
                                <TableCell>{task.assignedTo || "—"}</TableCell>
                                <TableCell>{task.estimateEffortHrs || "—"}</TableCell>
                                <TableCell>{task.plannedStartDate || "—"}</TableCell>
                                <TableCell>{task.plannedEndDate || "—"}</TableCell>
                                <TableCell>{taskStatusFromApi(task.status)}</TableCell>
                                <TableCell>
                                  <IconButton
                                    size="small"
                                    onClick={() => openTaskModal(milestone, task)}
                                    aria-label="Edit task"
                                  >
                                    <Edit2 size={14} color="#2E7D32" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      requestConfirm({
                                        title: "Delete Task?",
                                        description: `Are you sure you want to delete "${task.name}"? This action cannot be undone.`,
                                        confirmLabel: "Delete",
                                        onConfirm: () => {
                                          onRemoveTask(milestone.id, task.id);
                                          toast.success("Task removed");
                                        },
                                      })
                                    }
                                    aria-label="Delete task"
                                  >
                                    <Trash2 size={14} color="#DC2626" />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    )}
                  </Box>
                </Collapse>
              </Box>
            );
          })}
        </Box>
      )}

      <Dialog open={taskModalOpen} onClose={() => setTaskModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {taskModalMode === "edit" ? "Edit Task" : "Add Task"}
          {activeMilestone ? ` — ${activeMilestone.name}` : ""}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Milestone Name"
                value={activeMilestone?.name ?? ""}
                onChange={() => {}}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Task Name"
                value={taskForm.name}
                onChange={(v) => setTaskForm((p) => ({ ...p, name: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Estimate Effort Hrs"
                value={taskForm.estimateEffortHrs}
                onChange={(v) => setTaskForm((p) => ({ ...p, estimateEffortHrs: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Status"
                value={taskForm.status}
                onChange={(v) => setTaskForm((p) => ({ ...p, status: v }))}
                options={TASK_STATUS_OPTIONS}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Planned Start Date"
                type="date"
                value={taskForm.plannedStartDate}
                onChange={(v) => setTaskForm((p) => ({ ...p, plannedStartDate: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Planned End Date"
                type="date"
                value={taskForm.plannedEndDate}
                onChange={(v) => setTaskForm((p) => ({ ...p, plannedEndDate: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <SelectField
                label="Assigned To"
                value={taskForm.assignedTo}
                onChange={(v) => setTaskForm((p) => ({ ...p, assignedTo: v }))}
                options={teamAssigneeOptions}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTaskModalOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleSaveTask}>
            {taskModalMode === "edit" ? "Save Changes" : "Create Task"}
          </Button>
        </DialogActions>
      </Dialog>
      {confirmDialog}
    </Box>
  );
}
