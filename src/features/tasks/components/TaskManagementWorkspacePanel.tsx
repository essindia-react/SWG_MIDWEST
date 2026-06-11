import React, { useCallback, useEffect, useState } from "react";
import { Box, IconButton, ThemeProvider, Typography } from "@mui/material";
import { ArrowRight, X } from "lucide-react";
import { useIsMobile } from "../../../components/layout/Sidebar";
import { useProjects } from "../../../hooks/useProjects";
import { theme } from "../../../theme/theme";
import type { TaskManagementPanelTabId } from "../constants/taskManagementConstants";
import { TaskManagementSidebar } from "./TaskManagementSidebar";
import { TaskMilestoneMaterialRequestTab } from "./TaskMilestoneMaterialRequestTab";
import { TaskMilestonePickListTab } from "./TaskMilestonePickListTab";
import { TaskMilestoneTasksTab } from "./TaskMilestoneTasksTab";

interface TaskManagementWorkspacePanelProps {
  projectId: string;
  milestoneId: string;
  onClose: () => void;
}

export function TaskManagementWorkspacePanel({
  projectId,
  milestoneId,
  onClose,
}: TaskManagementWorkspacePanelProps) {
  const isMobile = useIsMobile();
  const { getProjectById } = useProjects();
  const project = getProjectById(projectId);
  const milestone = project?.milestones.find((m) => m.id === milestoneId);

  const [activeTab, setActiveTab] = useState<TaskManagementPanelTabId>("tasks");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  if (!project || !milestone) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 20,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <Box
        onClick={handleClose}
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.3)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />

      <ThemeProvider theme={theme}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            maxWidth: { md: "min(960px, 100%)" },
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
            transform: isVisible ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.5, sm: 2 },
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
              minWidth: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, flex: 1 }}>
              {!isMobile && (
                <IconButton
                  onClick={handleClose}
                  size="small"
                  sx={{
                    backgroundColor: "white",
                    transition: "box-shadow 0.1s ease",
                    "&:hover": {
                      backgroundColor: "white",
                      boxShadow:
                        "inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.8)",
                    },
                  }}
                  className="absolute top-1/2 -translate-x-[100%]"
                >
                  <ArrowRight size={20} />
                </IconButton>
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: "1rem", sm: "1.125rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {milestone.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  }}
                >
                  {project.projectCode} · {project.customerName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} size="small" sx={{ flexShrink: 0 }}>
              <X size={20} />
            </IconButton>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              flex: 1,
              overflow: "hidden",
              minHeight: 0,
            }}
          >
            <TaskManagementSidebar
              activeTab={activeTab}
              onTabClick={setActiveTab}
              milestoneName={milestone.name}
            />

            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                p: { xs: 2, sm: 3 },
                minWidth: 0,
                WebkitOverflowScrolling: "touch",
              }}
            >
              {activeTab === "tasks" && (
                <TaskMilestoneTasksTab projectId={projectId} milestone={milestone} />
              )}
              {activeTab === "pick-list" && (
                <TaskMilestonePickListTab projectId={projectId} milestone={milestone} />
              )}
              {activeTab === "material-request" && (
                <TaskMilestoneMaterialRequestTab project={project} milestone={milestone} />
              )}
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  );
}
