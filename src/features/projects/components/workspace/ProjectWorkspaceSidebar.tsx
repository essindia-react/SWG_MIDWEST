import React from "react";
import { Box, Typography } from "@mui/material";
import type { ProjectWorkspaceSidebarItem } from "../../constants/projectConstants";

const BRAND_GREEN = "#2E7D32";

interface ProjectWorkspaceSidebarProps {
  items: ProjectWorkspaceSidebarItem[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
  projectName: string;
}

export function ProjectWorkspaceSidebar({
  items,
  activeTab,
  onTabClick,
  projectName,
}: ProjectWorkspaceSidebarProps) {
  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: "divider" }}>
        <Typography sx={{ fontSize: "1rem", fontWeight: 700, lineHeight: 1.3 }}>
          {projectName}
        </Typography>
      </Box>

      <Box sx={{ py: 2, px: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {items.map((item, index) => {
          if (item.type === "heading") {
            return (
              <Typography
                key={`heading-${item.label}-${index}`}
                sx={{
                  px: 2,
                  pt: 2,
                  pb: 0.5,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "text.secondary",
                  cursor: "default",
                  userSelect: "none",
                }}
              >
                {item.label}
              </Typography>
            );
          }

          const { tab } = item;
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
                borderRadius: 2,
                border: "none",
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
                  lineHeight: 1.3,
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
