import React, { type ReactNode } from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  DollarSign,
  Package,
  HardHat,
  Truck,
  Receipt,
  TrendingUp,
  Percent,
} from "lucide-react";
import {
  calculateBudgetSummary,
  formatBudgetCurrency,
  formatBudgetPercent,
} from "../../../../lib/budgetHelpers";
import { SECTION_PLACEHOLDERS } from "../../constants/projectConstants";
import type { Project } from "../../../../types/project";

interface BudgetSummaryTabProps {
  project: Project;
}

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
  highlight?: boolean;
  negative?: boolean;
}

function MetricCard({ label, value, icon, accent, highlight, negative }: MetricCardProps) {
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
        <Typography
          sx={{
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "text.secondary",
            lineHeight: 1.4,
          }}
        >
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
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography
        sx={{
          fontSize: highlight ? "1.375rem" : "1.125rem",
          fontWeight: 700,
          color: negative ? "error.main" : highlight ? "primary.main" : "text.primary",
          lineHeight: 1.2,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

export function BudgetSummaryTab({ project }: BudgetSummaryTabProps) {
  const summary = calculateBudgetSummary(project);

  const contractValueDisplay =
    summary.contractValue > 0
      ? formatBudgetCurrency(summary.contractValue)
      : SECTION_PLACEHOLDERS.project;

  const profitMarginDisplay =
    summary.contractValue > 0
      ? formatBudgetPercent(summary.estimatedProfitMargin)
      : SECTION_PLACEHOLDERS.project;

  const isProfitNegative = summary.estimatedGrossProfit < 0;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, mb: 0.5 }}>
          Budget Summary
        </Typography>
        <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
          Auto-calculated from materials, crew, equipment, and overhead entries. Read-only.
        </Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Total Material Cost ($)"
            value={formatBudgetCurrency(summary.totalMaterialCost)}
            icon={<Package size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Total Labor Cost ($)"
            value={formatBudgetCurrency(summary.totalLaborCost)}
            icon={<HardHat size={16} color="#1565C0" />}
            accent="rgba(21, 101, 192, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Total Equipment Cost ($)"
            value={formatBudgetCurrency(summary.totalEquipmentCost)}
            icon={<Truck size={16} color="#6A1B9A" />}
            accent="rgba(106, 27, 154, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Total Other Expenses ($)"
            value={formatBudgetCurrency(summary.totalOtherExpenses)}
            icon={<Receipt size={16} color="#E65100" />}
            accent="rgba(230, 81, 0, 0.12)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <MetricCard
            label="Total Estimated Budget ($)"
            value={formatBudgetCurrency(summary.totalEstimatedBudget)}
            icon={<DollarSign size={18} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
            highlight
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MetricCard
            label="Project Contract Value ($)"
            value={contractValueDisplay}
            icon={<DollarSign size={18} color="#455A64" />}
            accent="rgba(69, 90, 100, 0.12)"
            highlight
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MetricCard
            label="Estimated Gross Profit ($)"
            value={formatBudgetCurrency(summary.estimatedGrossProfit)}
            icon={<TrendingUp size={18} color={isProfitNegative ? "#D32F2F" : "#2E7D32"} />}
            accent={isProfitNegative ? "rgba(211, 47, 47, 0.12)" : "rgba(46, 125, 50, 0.12)"}
            highlight
            negative={isProfitNegative}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <MetricCard
            label="Estimated Profit Margin (%)"
            value={profitMarginDisplay}
            icon={<Percent size={18} color="#1565C0" />}
            accent="rgba(21, 101, 192, 0.12)"
            highlight
            negative={summary.estimatedProfitMargin < 0}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
