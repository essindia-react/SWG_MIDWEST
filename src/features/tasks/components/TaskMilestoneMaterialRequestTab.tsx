import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Chip, Typography } from "@mui/material";
import { Plus, User } from "lucide-react";
import { formatProjectDate } from "../../../lib/projectHelpers";
import type { Project, ProjectMilestone, ProjectTask } from "../../../types/project";
import { getMaterialRequestsForTask } from "../lib/taskMaterialRequestHelpers";
import { TaskMaterialRequestModal } from "./TaskMaterialRequestModal";
import { TaskMaterialRequestStatusSummary } from "./TaskMaterialRequestStatusSummary";
import { TaskRowCard } from "./TaskRowCard";

interface TaskMilestoneMaterialRequestTabProps {
  project: Project;
  milestone: ProjectMilestone;
}

function TaskMaterialRequestRow({
  task,
  project,
  expanded,
  onToggle,
  onOpenModal,
  refreshKey,
}: {
  task: ProjectTask;
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  onOpenModal: (task: ProjectTask) => void;
  refreshKey: number;
}) {
  const requestCount = getMaterialRequestsForTask(project.projectCode, task.id, task.name).length;

  return (
    <TaskRowCard
      title={task.name}
      expanded={expanded}
      onToggle={onToggle}
      action={
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<Plus size={14} />}
          onClick={() => onOpenModal(task)}
          sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
        >
          Request
        </Button>
      }
      subtitle={
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5, alignItems: "center" }}>
          <Typography
            sx={{ fontSize: "0.75rem", color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <User size={12} />
            {task.assignedTo || "Unassigned"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {formatProjectDate(task.plannedStartDate)} – {formatProjectDate(task.plannedEndDate)}
          </Typography>
          {requestCount > 0 && !expanded && (
            <Chip
              label={`${requestCount} order${requestCount !== 1 ? "s" : ""}`}
              size="small"
              sx={{ height: 20, fontSize: "0.625rem", fontWeight: 600 }}
            />
          )}
        </Box>
      }
      summary={
        <TaskMaterialRequestStatusSummary
          key={refreshKey}
          projectCode={project.projectCode}
          taskId={task.id}
          taskName={task.name}
          refreshKey={refreshKey}
          compact
        />
      }
    >
      <Box sx={{ pt: 2 }}>
        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary", mb: 1.5 }}>
          Placed Orders
        </Typography>
        <TaskMaterialRequestStatusSummary
          key={`expanded-${refreshKey}`}
          projectCode={project.projectCode}
          taskId={task.id}
          taskName={task.name}
          refreshKey={refreshKey}
        />
      </Box>
    </TaskRowCard>
  );
}

export function TaskMilestoneMaterialRequestTab({
  project,
  milestone,
}: TaskMilestoneMaterialRequestTabProps) {
  const [modalTask, setModalTask] = useState<ProjectTask | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((k) => k + 1);
    window.addEventListener("material-requests-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("material-requests-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const tasks = useMemo(() => milestone.tasks, [milestone.tasks]);

  const handleSubmitted = (taskId: string) => {
    setRefreshKey((k) => k + 1);
    setExpandedTaskId(taskId);
    setModalTask(null);
  };

  if (tasks.length === 0) {
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
          No tasks in this milestone. Add tasks to submit material requests.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 2 }}>
        Use <strong>+ Request</strong> to place an order. Click the task row to slide down and view
        placed orders. Approved orders show &quot;Await delivery&quot;.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {tasks.map((task) => (
          <TaskMaterialRequestRow
            key={task.id}
            task={task}
            project={project}
            expanded={expandedTaskId === task.id}
            onToggle={() =>
              setExpandedTaskId(expandedTaskId === task.id ? null : task.id)
            }
            onOpenModal={setModalTask}
            refreshKey={refreshKey}
          />
        ))}
      </Box>

      {modalTask && (
        <TaskMaterialRequestModal
          open={Boolean(modalTask)}
          project={project}
          task={modalTask}
          milestoneName={milestone.name}
          onClose={() => setModalTask(null)}
          onSubmitted={() => handleSubmitted(modalTask.id)}
        />
      )}
    </Box>
  );
}
