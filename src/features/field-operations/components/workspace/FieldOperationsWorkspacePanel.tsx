import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Button, IconButton, ThemeProvider, Typography } from "@mui/material";
import { ArrowRight, Save, X } from "lucide-react";
import { toast } from "sonner";
import { useProjects } from "../../../../hooks/useProjects";
import { theme } from "../../../../theme/theme";
import type { FieldOperations } from "../../../../types/project";
import {
  FIELD_OPERATIONS_SIDEBAR,
  type FieldOperationsTabId,
} from "../../constants/fieldOperationsConstants";
import { ensureFieldOperations } from "../../lib/fieldOperationsHelpers";
import { ProjectWorkspaceSidebar } from "../../../projects/components/workspace/ProjectWorkspaceSidebar";
import { FieldOperationDetailsTab } from "./FieldOperationDetailsTab";
import { FieldDocumentsGuidesTab } from "./FieldDocumentsGuidesTab";
import { WorkOrderManagementTab } from "./WorkOrderManagementTab";
import { PickListManagementTab } from "./PickListManagementTab";
import { ActivityTimelineTab } from "./ActivityTimelineTab";

interface FieldOperationsWorkspacePanelProps {
  projectId: string;
  onClose: () => void;
}

export function FieldOperationsWorkspacePanel({
  projectId,
  onClose,
}: FieldOperationsWorkspacePanelProps) {
  const { projects, getProjectById, updateProject } = useProjects();
  const project = getProjectById(projectId);
  const projectIndex = useMemo(
    () => projects.findIndex((item) => item.id === projectId),
    [projects, projectId]
  );

  const [activeTab, setActiveTab] = useState<FieldOperationsTabId>("details");
  const [isVisible, setIsVisible] = useState(false);
  const [fieldOps, setFieldOps] = useState<FieldOperations | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    if (project) {
      setFieldOps(ensureFieldOperations(project, Math.max(projectIndex, 0)));
    }
  }, [project, projectIndex]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const handleFieldOpsChange = useCallback((updates: Partial<FieldOperations>) => {
    setFieldOps((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const handleSave = () => {
    if (!fieldOps) return;
    updateProject(projectId, { fieldOperations: fieldOps });
    toast.success("Field operations saved");
  };

  if (!project || !fieldOps) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "details":
        return <FieldOperationDetailsTab project={project} fieldOps={fieldOps} />;
      case "documents-guides":
        return (
          <FieldDocumentsGuidesTab
            fieldOps={fieldOps}
            onFieldOpsChange={handleFieldOpsChange}
          />
        );
      case "work-order":
        return (
          <WorkOrderManagementTab
            project={project}
            fieldOps={fieldOps}
            onFieldOpsChange={handleFieldOpsChange}
          />
        );
      case "pick-list":
        return (
          <PickListManagementTab fieldOps={fieldOps} onFieldOpsChange={handleFieldOpsChange} />
        );
      case "activity-timeline":
        return (
          <ActivityTimelineTab
            project={project}
            fieldOps={fieldOps}
            onFieldOpsChange={handleFieldOpsChange}
          />
        );
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
                onClick={handleClose}
                size="small"
                sx={{ backgroundColor: "white" }}
                className="absolute top-1/2 -translate-x-[100%]"
              >
                <ArrowRight size={20} />
              </IconButton>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.125rem" }}>
                  {fieldOps.workOrderNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.projectCode} · {project.customerName}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Save size={16} />}
                onClick={handleSave}
              >
                Save
              </Button>
              <IconButton onClick={handleClose} size="small">
                <X size={20} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
            <ProjectWorkspaceSidebar
              items={FIELD_OPERATIONS_SIDEBAR}
              activeTab={activeTab}
              onTabClick={(tabId) => setActiveTab(tabId as FieldOperationsTabId)}
              projectName={project.customerName}
            />

            <Box sx={{ flex: 1, overflowY: "auto", p: 4, minWidth: 0 }}>
              <Box sx={{ maxWidth: 960, mx: "auto" }}>{renderTabContent()}</Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Box>
  );
}
