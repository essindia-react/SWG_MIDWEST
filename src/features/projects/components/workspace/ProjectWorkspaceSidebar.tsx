import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { Save } from "lucide-react";
import type { ProjectWorkspaceSidebarItem } from "../../constants/projectConstants";

const BRAND_GREEN = "#2E7D32";

interface ProjectWorkspaceSidebarProps {
  items: ProjectWorkspaceSidebarItem[];
  activeTab: string;
  onTabClick: (tabId: string) => void;
  onSaveSection: (tabId: string) => void;
  projectName: string;
  disabledTabIds?: string[];
  hideSaveButtons?: boolean;
}

export function ProjectWorkspaceSidebar({
  items,
  activeTab,
  onTabClick,
  onSaveSection,
  projectName,
  disabledTabIds = [],
  hideSaveButtons = false,
}: ProjectWorkspaceSidebarProps) {
  return (
    <Box
      sx={{
        width: 260,
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
          const isDisabled = disabledTabIds.includes(tab.id);

          return (
            <Box
              key={tab.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                borderRadius: 2,
                bgcolor: isActive ? "rgba(46, 125, 50, 0.1)" : "transparent",
                opacity: isDisabled ? 0.45 : 1,
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: isDisabled
                    ? "transparent"
                    : isActive
                      ? "rgba(46, 125, 50, 0.12)"
                      : "action.hover",
                },
              }}
            >
              <Box
                component="button"
                type="button"
                disabled={isDisabled}
                onClick={() => {
                  if (!isDisabled) onTabClick(tab.id);
                }}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.5,
                  border: "none",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  textAlign: "left",
                  bgcolor: "transparent",
                  color: isActive ? BRAND_GREEN : "text.secondary",
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
              {!isDisabled && !hideSaveButtons && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSaveSection(tab.id);
                  }}
                  aria-label={`Save ${tab.label}`}
                  title={`Save ${tab.label}`}
                  sx={{
                    mr: 0.5,
                    color: isActive ? BRAND_GREEN : "text.secondary",
                    "&:hover": { bgcolor: "rgba(46, 125, 50, 0.12)" },
                  }}
                >
                  <Save size={14} />
                </IconButton>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
