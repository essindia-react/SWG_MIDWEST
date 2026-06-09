import React, { type ReactNode } from "react";
import { Box, Grid, Typography } from "@mui/material";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  FileText,
  Send,
} from "lucide-react";
import { calculateInvoicingMetrics, formatInvoiceCurrency } from "../../../lib/invoiceHelpers";
import type { Invoice } from "../../../types/invoice";
import type { Project } from "../../../types/project";

interface MetricCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
  highlight?: boolean;
}

function MetricCard({ label, value, icon, accent, highlight }: MetricCardProps) {
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

interface InvoicingMetricsDashboardProps {
  projects: Project[];
  invoices: Invoice[];
}

export function InvoicingMetricsDashboard({ projects, invoices }: InvoicingMetricsDashboardProps) {
  const metrics = calculateInvoicingMetrics(projects, invoices);

  return (
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, mb: 0.5 }}>
        Invoicing Overview
      </Typography>
      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 2.5 }}>
        Milestone billing metrics across all projects
      </Typography>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Total Invoices"
            value={String(metrics.totalInvoices)}
            icon={<FileText size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Ready to Invoice"
            value={String(metrics.readyToInvoice)}
            icon={<CheckCircle2 size={16} color="#0284C7" />}
            accent="rgba(2, 132, 199, 0.12)"
            highlight={metrics.readyToInvoice > 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Draft / Sent"
            value={`${metrics.draftCount} / ${metrics.sentCount}`}
            icon={<Send size={16} color="#7C3AED" />}
            accent="rgba(124, 58, 237, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <MetricCard
            label="Paid / Overdue"
            value={`${metrics.paidCount} / ${metrics.overdueCount}`}
            icon={<AlertCircle size={16} color="#DC2626" />}
            accent="rgba(220, 38, 38, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MetricCard
            label="Total Outstanding ($)"
            value={formatInvoiceCurrency(metrics.totalOutstanding)}
            icon={<Clock size={16} color="#D97706" />}
            accent="rgba(217, 119, 6, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <MetricCard
            label="Total Collected ($)"
            value={formatInvoiceCurrency(metrics.totalCollected)}
            icon={<DollarSign size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
            highlight
          />
        </Grid>
      </Grid>
    </Box>
  );
}
