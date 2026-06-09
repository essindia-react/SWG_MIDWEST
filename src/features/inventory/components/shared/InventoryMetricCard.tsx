import React, { type ReactNode } from "react";
import { Box, Typography } from "@mui/material";

interface InventoryMetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
  highlight?: boolean;
}

export function InventoryMetricCard({
  label,
  value,
  icon,
  accent,
  highlight,
}: InventoryMetricCardProps) {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: 1,
        borderColor: highlight ? "primary.main" : "divider",
        bgcolor: highlight ? "rgba(46, 125, 50, 0.04)" : "background.paper",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary" }}>
          {label}
        </Typography>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: accent ?? "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: highlight ? "1.375rem" : "1.125rem",
          fontWeight: 700,
          color: highlight ? "primary.main" : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
