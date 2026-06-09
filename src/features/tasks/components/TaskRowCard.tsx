import React from "react";
import { Box, Typography } from "@mui/material";
import { ChevronDown, ChevronRight } from "lucide-react";

interface TaskRowCardProps {
  title: string;
  subtitle?: React.ReactNode;
  summary?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function TaskRowCard({
  title,
  subtitle,
  summary,
  expanded,
  onToggle,
  action,
  children,
}: TaskRowCardProps) {
  return (
    <Box
      sx={{
        border: 1,
        borderColor: expanded ? "primary.main" : "divider",
        borderRadius: 2,
        bgcolor: "background.paper",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: 1,
          p: 2,
          bgcolor: expanded ? "rgba(46, 125, 50, 0.04)" : "background.paper",
          transition: "background-color 0.2s",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={onToggle}
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            p: 0,
            border: "none",
            cursor: "pointer",
            textAlign: "left",
            bgcolor: "transparent",
            minWidth: 0,
            "&:hover": { opacity: 0.9 },
          }}
        >
          {expanded ? (
            <ChevronDown size={18} style={{ marginTop: 2, flexShrink: 0, color: "#64748B" }} />
          ) : (
            <ChevronRight size={18} style={{ marginTop: 2, flexShrink: 0, color: "#64748B" }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.9375rem", fontWeight: 700 }}>{title}</Typography>
            {subtitle}
            {!expanded && summary && (
              <Box sx={{ mt: 1 }}>{summary}</Box>
            )}
          </Box>
        </Box>
        {action && (
          <Box
            sx={{ flexShrink: 0, pt: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {action}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition: "grid-template-rows 0.25s ease-out",
        }}
      >
        <Box sx={{ minHeight: 0, overflow: "hidden" }}>
          <Box
            sx={{
              px: 2,
              pb: 2,
              pt: 0,
              ml: 4.5,
              borderTop: expanded ? 1 : 0,
              borderColor: "divider",
            }}
          >
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
