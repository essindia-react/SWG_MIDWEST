import React, { useCallback, useEffect, useState } from "react";
import { Box, IconButton, ThemeProvider, Typography } from "@mui/material";
import { ArrowRight, X } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "../../../../hooks/useProjects";
import { syncProjectBudgetToPurchaseOrders } from "../../../../lib/inventoryIntegration";
import { theme } from "../../../../theme/theme";
import type { ProjectBudget, ProjectDocument } from "../../../../types/project";
import type { ProjectWorkspaceTabId } from "../../constants/projectConstants";
import { PROJECT_WORKSPACE_SIDEBAR } from "../../constants/projectConstants";
import { AssignTeamsTab } from "./AssignTeamsTab";
import { MilestonesTab } from "./MilestonesTab";
import { ProjectDetailsTab } from "./ProjectDetailsTab";
import { BudgetSummaryTab } from "./BudgetSummaryTab";
import { CrewCostTab } from "./CrewCostTab";
import { EquipmentCostTab } from "./EquipmentCostTab";
import { MaterialsCostTab } from "./MaterialsCostTab";
import { OverheadExpensesTab } from "./OverheadExpensesTab";
import { ProjectDocumentsTab } from "./ProjectDocumentsTab";
import { ProjectCreateTab } from "./ProjectCreateTab";
import { ProjectEditTab } from "./ProjectEditTab";
import { ProjectWorkspaceSidebar } from "./ProjectWorkspaceSidebar";

interface ProjectWorkspacePanelBaseProps {
  initialTab?: ProjectWorkspaceTabId;
  onClose: () => void;
}

interface ProjectWorkspaceViewProps extends ProjectWorkspacePanelBaseProps {
  mode?: "view";
  projectId: string;
}

interface ProjectWorkspaceCreateProps extends ProjectWorkspacePanelBaseProps {
  mode: "create";
  onCreated: (projectId: string) => void;
}

type ProjectWorkspacePanelProps = ProjectWorkspaceViewProps | ProjectWorkspaceCreateProps;

export interface ProjectWorkspaceFocus {
  milestoneId?: string;
  taskId?: string;
}

export function ProjectWorkspacePanel(props: ProjectWorkspacePanelProps) {
  const { initialTab = "details", onClose } = props;
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const isCreateMode = props.mode === "create" && !createdProjectId;

  const {
    getProjectById,
    updateProject,
    addTeamAssignment,
    updateTeamAssignment,
    removeTeamAssignment,
    addMilestone,
    updateMilestone,
    removeMilestone,
    addTask,
    updateTask,
    removeTask,
  } = useProjects();
  const projectId =
    createdProjectId ?? (props.mode === "create" ? undefined : props.projectId);
  const project = projectId ? getProjectById(projectId) : undefined;
  const [activeTab, setActiveTab] = useState<ProjectWorkspaceTabId>(initialTab);
  const [focus, setFocus] = useState<ProjectWorkspaceFocus>({});
  const [isVisible, setIsVisible] = useState(false);

  const onCreatedCallback = props.mode === "create" ? props.onCreated : undefined;

  const handleCreated = useCallback(
    (id: string) => {
      setCreatedProjectId(id);
      setActiveTab("details");
      onCreatedCallback?.(id);
    },
    [onCreatedCallback]
  );

  const disabledTabIds = isCreateMode
    ? PROJECT_WORKSPACE_SIDEBAR.filter(
        (item) => item.type === "tab" && item.tab.id !== "details"
      ).map((item) => (item.type === "tab" ? item.tab.id : ""))
    : [];

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const clearFocus = useCallback(() => {
    setFocus({});
  }, []);

  if (!isCreateMode && !project) {
    return null;
  }

  const SECTION_SAVE_LABELS: Record<string, string> = {
    details: "Project details",
    teams: "Team assignments",
    milestones: "Milestones",
    documents: "Documents",
    "budget-materials": "Materials cost",
    "budget-crew": "Crew cost",
    "budget-equipment": "Equipment cost",
    "budget-overhead": "Overhead expenses",
    "budget-summary": "Budget summary",
  };

  const handleSaveSection = (tabId: string) => {
    if (tabId !== activeTab) {
      setFocus({});
      setActiveTab(tabId as ProjectWorkspaceTabId);
    }
    if (
      project &&
      (tabId === "budget-materials" || tabId === "budget-equipment")
    ) {
      syncProjectBudgetToPurchaseOrders(project);
    }
    const label = SECTION_SAVE_LABELS[tabId] ?? "Section";
    toast.success(`${label} saved`);
  };

  const handleDocumentsChange = (documents: ProjectDocument[]) => {
    if (!projectId) return;
    updateProject(projectId, { documents });
  };

  const handleBudgetChange = (budget: ProjectBudget) => {
    if (!projectId || !project) return;
    updateProject(projectId, { budget });
    syncProjectBudgetToPurchaseOrders({ ...project, budget });
  };

  const sidebarItems = PROJECT_WORKSPACE_SIDEBAR;

  const renderTabContent = () => {
    if (isCreateMode) {
      return <ProjectCreateTab onCreated={handleCreated} onCancel={handleClose} />;
    }

    if (!project) return null;

    switch (activeTab) {
      case "details":
        return (
          <ProjectDetailsTab
            project={project}
            onEditProject={() => setActiveTab("edit")}
          />
        );
      case "edit":
        return (
          <ProjectEditTab
            project={project}
            onSave={(updates) => {
              if (!projectId) return;
              updateProject(projectId, updates);
              setActiveTab("details");
            }}
          />
        );
      case "teams":
        return (
          <AssignTeamsTab
            project={project}
            onAddAssignment={(input) => {
              if (!projectId) return;
              addTeamAssignment(projectId, input);
            }}
            onUpdateAssignment={(id, updates) => {
              if (!projectId) return;
              updateTeamAssignment(projectId, id, updates);
            }}
            onRemoveAssignment={(id) => {
              if (!projectId) return;
              removeTeamAssignment(projectId, id);
            }}
          />
        );
      case "milestones":
        return (
          <MilestonesTab
            project={project}
            focusMilestoneId={focus.milestoneId}
            focusTaskId={focus.taskId}
            onFocusHandled={clearFocus}
            onAddMilestone={(input) => {
              if (!projectId) return;
              addMilestone(projectId, input);
            }}
            onUpdateMilestone={(id, updates) => {
              if (!projectId) return;
              updateMilestone(projectId, id, updates);
            }}
            onRemoveMilestone={(id) => {
              if (!projectId) return;
              removeMilestone(projectId, id);
            }}
            onAddTask={(input) => {
              if (!projectId) return;
              addTask(projectId, input);
            }}
            onUpdateTask={(milestoneId, taskId, updates) => {
              if (!projectId) return;
              updateTask(projectId, milestoneId, taskId, updates);
            }}
            onRemoveTask={(milestoneId, taskId) => {
              if (!projectId) return;
              removeTask(projectId, milestoneId, taskId);
            }}
          />
        );
      case "documents":
        return (
          <ProjectDocumentsTab
            project={project}
            onDocumentsChange={handleDocumentsChange}
          />
        );
      case "budget-materials":
        return (
          <MaterialsCostTab project={project} onBudgetChange={handleBudgetChange} />
        );
      case "budget-crew":
        return <CrewCostTab project={project} onBudgetChange={handleBudgetChange} />;
      case "budget-equipment":
        return (
          <EquipmentCostTab project={project} onBudgetChange={handleBudgetChange} />
        );
      case "budget-overhead":
        return (
          <OverheadExpensesTab project={project} onBudgetChange={handleBudgetChange} />
        );
      case "budget-summary":
        return <BudgetSummaryTab project={project} />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        zIndex: 20,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <Box
        onClick={handleClose}
        sx={{
          position: "absolute",
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
            maxWidth: { md: "min(1100px, 100%)" },
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
              px: 2,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={() => {
                  if (activeTab === "edit") setActiveTab("details");
                  else handleClose();
                }}
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
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
                  {isCreateMode
                    ? "Create New Project"
                    : activeTab === "edit"
                      ? "Edit Project"
                      : project?.projectCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {isCreateMode
                    ? "Fill in project details to get started"
                    : project?.customerName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* {activeTab === "details" && (
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<Edit2 size={16} />}
                  onClick={() => setActiveTab("edit")}
                >
                  Edit
                </Button>
              )} */}
              <IconButton onClick={handleClose} size="small">
                <X size={20} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
            {activeTab !== "edit" && (
              <ProjectWorkspaceSidebar
                items={sidebarItems}
                activeTab={activeTab}
                onTabClick={(tabId) => {
                  setFocus({});
                  setActiveTab(tabId as ProjectWorkspaceTabId);
                }}
                onSaveSection={handleSaveSection}
                projectName={isCreateMode ? "New Project" : project!.customerName}
                disabledTabIds={disabledTabIds}
                hideSaveButtons={isCreateMode}
              />
            )}

            <Box sx={{ flex: 1, overflowY: "auto", p: 4, minWidth: 0 }}>
              <Box sx={{ maxWidth: 960, mx: "auto" }}>{renderTabContent()}</Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  );
}
