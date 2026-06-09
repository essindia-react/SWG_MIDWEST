import React, { useEffect, useState } from "react";
import { Box, Button, Chip, MenuItem, TextField, Typography } from "@mui/material";
import { CheckCircle2, Clock, Flag, Save, User } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "../../../hooks/useProjects";
import { formatProjectDate } from "../../../lib/projectHelpers";
import type { ProjectMilestone, ProjectTask } from "../../../types/project";
import {
  TASK_STATUS_OPTIONS,
  taskStatusFromApi,
  taskStatusToApi,
} from "../../projects/constants/projectConstants";
import { formatTaskDateTime } from "../lib/taskManagementFormatters";
import { TaskMaterialRequestStatusSummary } from "./TaskMaterialRequestStatusSummary";
import { TaskRowCard } from "./TaskRowCard";

interface TaskDraft {
  fieldVisitTime: string;
  fieldExitTime: string;
  status: string;
  remarks: string;
}

function taskToDraft(task: ProjectTask): TaskDraft {
  return {
    fieldVisitTime: task.fieldVisitTime ?? "",
    fieldExitTime: task.fieldExitTime ?? "",
    status: taskStatusFromApi(task.status),
    remarks: task.remarks ?? "",
  };
}

function hasSavedFields(task: ProjectTask): boolean {
  return Boolean(
    task.fieldVisitTime || task.fieldExitTime || task.remarks || task.status !== "not-started"
  );
}

function TaskSummary({
  task,
  projectCode,
  refreshKey,
}: {
  task: ProjectTask;
  projectCode: string;
  refreshKey: number;
}) {
  const hasFields = hasSavedFields(task);

  return (
    <Box sx={{ width: "100%" }}>
      {hasFields ? (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          <Chip
            label={taskStatusFromApi(task.status)}
            size="small"
            sx={{ height: 22, fontSize: "0.6875rem", fontWeight: 600 }}
          />
          {task.fieldVisitTime && (
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              Visit: {formatTaskDateTime(task.fieldVisitTime)}
            </Typography>
          )}
          {task.fieldExitTime && (
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              · Exit: {formatTaskDateTime(task.fieldExitTime)}
            </Typography>
          )}
          {task.remarks && (
            <Typography
              sx={{
                fontSize: "0.75rem",
                color: "text.secondary",
                width: "100%",
                mt: 0.25,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Remarks: {task.remarks}
            </Typography>
          )}
        </Box>
      ) : (
        <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", fontStyle: "italic" }}>
          Click to add field visit details
        </Typography>
      )}
      <Box sx={{ mt: hasFields ? 1 : 0.75 }}>
        <TaskMaterialRequestStatusSummary
          key={refreshKey}
          projectCode={projectCode}
          taskId={task.id}
          taskName={task.name}
          refreshKey={refreshKey}
          hideEmpty
        />
      </Box>
    </Box>
  );
}

interface TaskMilestoneTasksTabProps {
  projectId: string;
  milestone: ProjectMilestone;
}

export function TaskMilestoneTasksTab({ projectId, milestone }: TaskMilestoneTasksTabProps) {
  const { updateTask, getProjectById } = useProjects();
  const project = getProjectById(projectId);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, TaskDraft>>({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const next: Record<string, TaskDraft> = {};
    for (const task of milestone.tasks) {
      next[task.id] = taskToDraft(task);
    }
    setDrafts(next);
  }, [milestone]);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("material-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("material-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const updateDraft = (taskId: string, updates: Partial<TaskDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates },
    }));
  };

  const handleSave = (task: ProjectTask) => {
    const draft = drafts[task.id];
    if (!draft) return;

    updateTask(projectId, milestone.id, task.id, {
      fieldVisitTime: draft.fieldVisitTime,
      fieldExitTime: draft.fieldExitTime,
      status: taskStatusToApi(draft.status),
      remarks: draft.remarks,
    });
    setExpandedTaskId(null);
    toast.success(`"${task.name}" saved`);
  };

  const handleMarkComplete = (task: ProjectTask) => {
    updateTask(projectId, milestone.id, task.id, { status: "completed" });
    updateDraft(task.id, { status: "Completed" });
    setExpandedTaskId(null);
    toast.success(`"${task.name}" marked as complete`);
  };

  if (milestone.tasks.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          No tasks in this milestone.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {milestone.tasks.map((task) => {
        const draft = drafts[task.id] ?? taskToDraft(task);
        const isExpanded = expandedTaskId === task.id;

        return (
          <TaskRowCard
            key={task.id}
            title={task.name}
            expanded={isExpanded}
            onToggle={() => setExpandedTaskId(isExpanded ? null : task.id)}
            subtitle={
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <User size={12} />
                  {task.assignedTo || "Unassigned"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {formatProjectDate(task.plannedStartDate)} – {formatProjectDate(task.plannedEndDate)}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                  {task.estimateEffortHrs}h estimated
                </Typography>
              </Box>
            }
            summary={
              <TaskSummary
                task={task}
                projectCode={project?.projectCode ?? ""}
                refreshKey={refreshKey}
              />
            }
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
                pt: 2,
                mb: 2,
              }}
            >
              {[
                { icon: Flag, label: "Milestone", value: milestone.name },
                { icon: User, label: "Assigned To", value: task.assignedTo || "Unassigned" },
                {
                  icon: Clock,
                  label: "Planned Dates",
                  value: `${formatProjectDate(task.plannedStartDate)} – ${formatProjectDate(task.plannedEndDate)}`,
                },
                {
                  icon: Clock,
                  label: "Estimated Effort",
                  value: `${task.estimateEffortHrs} hours`,
                },
              ].map((row) => {
                const Icon = row.icon;
                return (
                  <Box
                    key={row.label}
                    sx={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "grey.50",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Icon size={14} style={{ marginTop: 2, color: "#2E7D32", flexShrink: 0 }} />
                    <Box>
                      <Typography sx={{ fontSize: "0.625rem", fontWeight: 600, color: "text.secondary" }}>
                        {row.label}
                      </Typography>
                      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                        {row.value}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
                mb: 2,
              }}
            >
              <TextField
                label="Field Visit Time"
                type="datetime-local"
                value={draft.fieldVisitTime}
                onChange={(e) => updateDraft(task.id, { fieldVisitTime: e.target.value })}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Exit Time"
                type="datetime-local"
                value={draft.fieldExitTime}
                onChange={(e) => updateDraft(task.id, { fieldExitTime: e.target.value })}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                select
                label="Status"
                value={draft.status}
                onChange={(e) => updateDraft(task.id, { status: e.target.value })}
                size="small"
                fullWidth
              >
                {TASK_STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Remarks"
                value={draft.remarks}
                onChange={(e) => updateDraft(task.id, { remarks: e.target.value })}
                size="small"
                fullWidth
                multiline
                rows={2}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
              {task.status !== "completed" && (
                <Button
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={<CheckCircle2 size={14} />}
                  onClick={() => handleMarkComplete(task)}
                >
                  Mark as Complete
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                size="small"
                startIcon={<Save size={14} />}
                onClick={() => handleSave(task)}
              >
                Save
              </Button>
            </Box>
          </TaskRowCard>
        );
      })}
    </Box>
  );
}
