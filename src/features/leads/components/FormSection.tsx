import React from "react";
import { Box, Typography } from "@mui/material";
import type { LucideIcon } from "lucide-react";

interface FormSectionProps {
  icon: LucideIcon;
  title: string;
  children: React.ReactNode;
  variant?: "default" | "highlight";
}

export function FormSection({
  icon: Icon,
  title,
  children,
  variant = "default",
}: FormSectionProps) {
  const isHighlight = variant === "highlight";

  return (
    <Box
      sx={{
        ...(isHighlight && {
          bgcolor: "#EFF6FF",
          border: "1px solid #BFDBFE",
          borderRadius: 2,
          p: 2.5,
        }),
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderBottom: isHighlight ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
          pb: 1,
          mb: 2.5,
        }}
      >
        <Icon size={20} color={isHighlight ? "#1D4ED8" : "#2563EB"} />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: isHighlight ? "#1E3A8A" : "#1E293B",
            fontSize: "1rem",
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  );
}
