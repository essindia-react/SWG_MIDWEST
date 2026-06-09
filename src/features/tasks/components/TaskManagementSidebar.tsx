import React from "react";
import { Box, Typography } from "@mui/material";
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

export function TaskManagementSidebar({
  activeTab,
  onTabClick,
  milestoneName,
}: TaskManagementSidebarProps) {
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
        {TASK_MANAGEMENT_PANEL_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <Box
              key={tab.id}
              component="button"
              type="button"
              onClick={() => onTabClick(tab.id)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1.5,
                border: "none",
                borderRadius: 2,
                cursor: "pointer",
                textAlign: "left",
                bgcolor: isActive ? "rgba(46, 125, 50, 0.1)" : "transparent",
                color: isActive ? BRAND_GREEN : "text.secondary",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: isActive ? "rgba(46, 125, 50, 0.12)" : "action.hover",
                },
              }}
            >
              <Icon size={18} strokeWidth={isActive ? 2.25 : 2} />
              <Typography
                sx={{
                  fontSize: "0.8125rem",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? BRAND_GREEN : "text.primary",
                }}
              >
                {tab.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
