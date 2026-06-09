import { Chip } from "@mui/material";

interface InventoryStatusChipProps {
  label: string;
  bg: string;
  color: string;
  size?: "small" | "medium";
}

export function InventoryStatusChip({
  label,
  bg,
  color,
  size = "small",
}: InventoryStatusChipProps) {
  return (
    <Chip
      label={label}
      size={size}
      sx={{
        bgcolor: bg,
        color,
        fontWeight: 600,
        fontSize: "0.75rem",
        height: size === "small" ? 24 : 28,
      }}
    />
  );
}
