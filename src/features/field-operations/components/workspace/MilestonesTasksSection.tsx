import React from "react";
import { Box, Typography } from "@mui/material";
import { FileText, Flag } from "lucide-react";
import { formatProjectDate, getProjectStatusConfig } from "../../../../lib/projectHelpers";
import {
  displayValue,
  milestoneStatusFromApi,
  SECTION_PLACEHOLDERS,
  taskStatusFromApi,
} from "../../../projects/constants/projectConstants";
import type { Project } from "../../../../types/project";

function PlaceholderText({ children }: { children: React.ReactNode }) {
  return (
    <Typography sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}>
      {children}
    </Typography>
  );
}

export function MilestonesTasksSection({ project }: { project: Project }) {
  return (
    <Box>
      {project.milestones.length === 0 ? (
        <PlaceholderText>{SECTION_PLACEHOLDERS.milestones}</PlaceholderText>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {project.milestones.map((milestone) => {
            const msStatus = getProjectStatusConfig(
              milestone.status as "completed" | "in-progress" | "on-hold"
            );
            return (
              <Box
                key={milestone.id}
                sx={{
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    px: 2,
                    py: 1.5,
                    bgcolor: "background.paper",
                  }}
                >
                  <Flag size={16} color="#2E7D32" />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                      {milestone.name}
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                      {displayValue(
                        milestone.assignedTo,
                        undefined,
                        SECTION_PLACEHOLDERS.milestones
                      )}{" "}
                      ·{" "}
                      {displayValue(
                        milestone.plannedStartDate,
                        formatProjectDate,
                        SECTION_PLACEHOLDERS.milestones
                      )}
                      {milestone.plannedEndDate
                        ? ` – ${formatProjectDate(milestone.plannedEndDate)}`
                        : ""}
                    </Typography>
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      px: 1.25,
                      py: 0.25,
                      borderRadius: 999,
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      bgcolor: msStatus.bg,
                      color: msStatus.color,
                    }}
                  >
                    {milestoneStatusFromApi(milestone.status)}
                  </Box>
                </Box>

                <Box sx={{ borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}>
                  {milestone.tasks.length === 0 ? (
                    <Box sx={{ px: 2, pl: 4, py: 1.25 }}>
                      <PlaceholderText>{SECTION_PLACEHOLDERS.tasks}</PlaceholderText>
                    </Box>
                  ) : (
                    milestone.tasks.map((task) => (
                      <Box
                        key={task.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          pl: 4,
                          py: 1.25,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <FileText size={14} color="#64748B" />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                            {task.name}
                          </Typography>
                          <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                            {displayValue(
                              task.assignedTo,
                              undefined,
                              SECTION_PLACEHOLDERS.tasks
                            )}
                            {task.estimateEffortHrs ? ` · ${task.estimateEffortHrs}h` : ""}
                          </Typography>
                        </Box>
                        <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                          {taskStatusFromApi(task.status)}
                        </Typography>
                      </Box>
                    ))
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
