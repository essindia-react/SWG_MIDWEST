import React from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FileText } from "lucide-react";
import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  resolveInvoiceStatus,
} from "../../../lib/invoiceHelpers";
import type { Invoice } from "../../../types/invoice";
import type { Project } from "../../../types/project";
import { invoiceStatusColor, invoiceStatusLabel } from "../constants/invoicingConstants";

interface InvoiceDraftListProps {
  invoices: Invoice[];
  projects: Project[];
  onDraftClick: (invoice: Invoice) => void;
  selectedDraftId?: string;
}

export function InvoiceDraftList({
  invoices,
  projects,
  onDraftClick,
  selectedDraftId,
}: InvoiceDraftListProps) {
  const drafts = [...invoices].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  if (drafts.length === 0) return null;

  const getProjectLabel = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project ? `${project.projectCode} — ${project.customerName}` : "—";
  };

  return (
    <Box sx={{ mt: 3, mb: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <FileText size={18} />
        <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>Draft Invoices</Typography>
        <Chip label={drafts.length} size="small" sx={{ height: 22, fontSize: "0.75rem" }} />
      </Box>
      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 2 }}>
        Saved drafts appear here. Click a row to continue editing and send.
      </Typography>

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "#1e3a5f" }}>
              {[
                "Invoice #",
                "Project",
                "Milestone",
                "Bill To",
                "Invoice Date",
                "Total Due",
                "Status",
              ].map((col) => (
                <TableCell
                  key={col}
                  sx={{ color: "#fff", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap" }}
                >
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {drafts.map((invoice) => {
              const status = resolveInvoiceStatus(invoice);
              const colors = invoiceStatusColor(status);

              return (
                <TableRow
                  key={invoice.id}
                  hover
                  onClick={() => onDraftClick(invoice)}
                  selected={invoice.id === selectedDraftId}
                  sx={{ cursor: "pointer" }}
                >
                  <TableCell sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "primary.main" }}>
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {getProjectLabel(invoice.projectId)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{invoice.milestoneName}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{invoice.billToName}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    {formatInvoiceDate(invoice.invoiceDate)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    {formatInvoiceCurrency(invoice.totalDue)}
                  </TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>
                    <Chip
                      label={invoiceStatusLabel(status)}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        bgcolor: colors.bg,
                        color: colors.color,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}
