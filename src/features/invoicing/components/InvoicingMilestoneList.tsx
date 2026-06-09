import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  formatInvoiceDate,
  getMilestoneCompletionPct,
  getMilestoneStatusCode,
  getMilestoneWeight,
  getTaskCompletionPct,
  getTaskStatusCode,
} from "../../../lib/invoiceHelpers";
import type { Project, ProjectMilestone } from "../../../types/project";

interface InvoicingMilestoneListProps {
  projects: Project[];
  onMilestoneClick: (projectId: string, milestone: ProjectMilestone) => void;
}

function MilestoneSection({
  project,
  milestone,
  onMilestoneClick,
}: {
  project: Project;
  milestone: ProjectMilestone;
  onMilestoneClick: (projectId: string, milestone: ProjectMilestone) => void;
}) {
  const weight = getMilestoneWeight(milestone, project.milestones);
  const completion = getMilestoneCompletionPct(milestone);
  const statusCode = getMilestoneStatusCode(milestone);

  return (
    <Box sx={{ mb: 2 }}>
      <Box
        component="button"
        type="button"
        onClick={() => onMilestoneClick(project.id, milestone)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 2,
          px: 2,
          py: 1.5,
          bgcolor: "grey.100",
          border: "none",
          borderBottom: 1,
          borderColor: "divider",
          cursor: "pointer",
          textAlign: "left",
          "&:hover": { bgcolor: "grey.200" },
        }}
      >
        <Typography sx={{ flex: 1, fontWeight: 700, fontSize: "0.875rem" }}>
          Milestone Name: {milestone.name}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", minWidth: 100 }}>
          Milestone Wtg: {weight}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", minWidth: 130 }}>
          Milestone Compl Per: {completion}
        </Typography>
        <Typography sx={{ fontWeight: 700, fontSize: "0.8125rem", minWidth: 100 }}>
          Milestone Status: {statusCode}
        </Typography>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "#1e3a5f" }}>
            {[
              "Task Name",
              "Task Est Efforts",
              "Task Plan Start Date",
              "Task Plan End Date",
              "Task Act Start Date",
              "Task Act End Date",
              "Task Wtg",
              "Task Compl Per",
              "Task Act Efforts",
              "Task Status",
            ].map((col) => (
              <TableCell
                key={col}
                sx={{ color: "#fff", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}
              >
                {col}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {milestone.tasks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                No tasks defined for this milestone
              </TableCell>
            </TableRow>
          ) : (
            milestone.tasks.map((task) => {
              const taskWeight =
                milestone.estimateEffortHrs > 0
                  ? Math.round(
                      ((task.estimateEffortHrs || 0) / milestone.estimateEffortHrs) * weight
                    )
                  : 0;
              return (
                <TableRow
                  key={task.id}
                  hover
                  onClick={() => onMilestoneClick(project.id, milestone)}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{task.name}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{task.estimateEffortHrs || "—"}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {formatInvoiceDate(task.plannedStartDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {formatInvoiceDate(task.plannedEndDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>—</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>—</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{taskWeight}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {getTaskCompletionPct(task)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>—</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {getTaskStatusCode(task)}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Box>
  );
}

export function InvoicingMilestoneList({ projects, onMilestoneClick }: InvoicingMilestoneListProps) {
  const projectsWithMilestones = projects.filter((p) => p.milestones.length > 0);

  if (projectsWithMilestones.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ fontSize: "0.875rem" }}>
        No project milestones available for invoicing.
      </Typography>
    );
  }

  return (
    <Box>
      {projectsWithMilestones.map((project) => (
        <Box
          key={project.id}
          sx={{
            mb: 4,
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            overflow: "hidden",
            bgcolor: "background.paper",
          }}
        >
          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: "grey.50",
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
              {project.projectCode} — {project.customerName}
            </Typography>
          </Box>

          {project.milestones.map((milestone) => (
            <MilestoneSection
              key={milestone.id}
              project={project}
              milestone={milestone}
              onMilestoneClick={onMilestoneClick}
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}
