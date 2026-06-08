import { Chip } from "@mui/material";
import type { LeadStatus } from "../../../types/lead";
import { LEAD_STATUS_CONFIG } from "../../../lib/constants";


interface LeadStatusChipProps {
  status: LeadStatus;
  size?: "small" | "medium";
}

export function LeadStatusChip({ status, size = "small" }: LeadStatusChipProps) {
  const config = LEAD_STATUS_CONFIG[status];

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: size === "small" ? "0.7rem" : "0.75rem",
      }}
    />
  );
}
