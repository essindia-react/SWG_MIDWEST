import React from "react";
import { Box, Button, InputAdornment, TextField, Typography } from "@mui/material";
import { Download, Filter, Plus, Search } from "lucide-react";

interface InventoryPageHeaderProps {
  title: string;
  subtitle?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onFilter?: () => void;
  onExport?: () => void;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showExport?: boolean;
  extraActions?: React.ReactNode;
}

export function InventoryPageHeader({
  title,
  subtitle,
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  onFilter,
  onExport,
  onPrimaryAction,
  primaryActionLabel = "Add",
  showSearch = true,
  showFilter = true,
  showExport = true,
  extraActions,
}: InventoryPageHeaderProps) {
  return (
    <Box
      sx={{
        // position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.default",
        pb: 2,
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>{title}</Typography>
          {subtitle && (
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
          {showSearch && onSearchChange && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="#9E9E9E" />
                  </InputAdornment>
                ),
              }}
            />
          )}
          {showFilter && onFilter && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Filter size={16} />}
              onClick={onFilter}
              sx={{ borderColor: "divider", color: "text.primary" }}
            >
              Filter
            </Button>
          )}
          {showExport && onExport && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download size={16} />}
              onClick={onExport}
              sx={{ borderColor: "divider", color: "text.primary" }}
            >
              Export
            </Button>
          )}
          {extraActions}
          {onPrimaryAction && (
            <Button
              variant="contained"
              size="small"
              startIcon={<Plus size={16} />}
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
