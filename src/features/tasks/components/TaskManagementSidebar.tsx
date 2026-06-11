import React from "react";
import { Box, Typography } from "@mui/material";
import { useIsMobile } from "../../../components/layout/Sidebar";
import type { LucideIcon } from "lucide-react";
import {
  TASK_MANAGEMENT_PANEL_TABS,
  type TaskManagementPanelTabId,
} from "../constants/taskManagementConstants";

const BRAND_GREEN = "#2E7D32";

interface TaskManagementSidebarProps {
  activeTab: TaskManagementPanelTabId;
  onTabClick: (tabId: TaskManagementPanelTabId) => void;
  milestoneName: string;
}

function TabButton({
  tabId,
  label,
  icon: Icon,
  isActive,
  onClick,
  compact = false,
}: {
  tabId: TaskManagementPanelTabId;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: (tabId: TaskManagementPanelTabId) => void;
  compact?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={() => onClick(tabId)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: compact ? 0.75 : 1.5,
        px: compact ? 1.5 : 2,
        py: compact ? 1 : 1.5,
        border: "none",
        borderRadius: 2,
        cursor: "pointer",
        textAlign: "left",
        flexShrink: 0,
        bgcolor: isActive ? "rgba(46, 125, 50, 0.1)" : "transparent",
        color: isActive ? BRAND_GREEN : "text.secondary",
        transition: "all 0.2s",
        "&:hover": {
          bgcolor: isActive ? "rgba(46, 125, 50, 0.12)" : "action.hover",
        },
      }}
    >
      <Icon size={compact ? 16 : 18} strokeWidth={isActive ? 2.25 : 2} />
      <Typography
        sx={{
          fontSize: compact ? "0.75rem" : "0.8125rem",
          fontWeight: isActive ? 700 : 500,
          color: isActive ? BRAND_GREEN : "text.primary",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}

export function TaskManagementSidebar({
  activeTab,
  onTabClick,
  milestoneName,
}: TaskManagementSidebarProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Box
        sx={{
          flexShrink: 0,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.default",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            px: 1.5,
            py: 1,
            minWidth: "min-content",
          }}
        >
          {TASK_MANAGEMENT_PANEL_TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tabId={tab.id}
              label={tab.label}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onClick={onTabClick}
              compact
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 220,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700, lineHeight: 1.3 }}>
          {milestoneName}
        </Typography>
      </Box>

      <Box sx={{ py: 2, px: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {TASK_MANAGEMENT_PANEL_TABS.map((tab) => (
          <TabButton
            key={tab.id}
            tabId={tab.id}
            label={tab.label}
            icon={tab.icon}
            isActive={activeTab === tab.id}
            onClick={onTabClick}
          />
        ))}
      </Box>
    </Box>
  );
}
