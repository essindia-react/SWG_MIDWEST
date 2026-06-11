import React, { useCallback, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Eye, FileText, Plus } from "lucide-react";
import {
  formatInvoiceCurrency,
  formatInvoiceDate,
  resolveInvoiceStatus,
} from "../../../lib/invoiceHelpers";
import type { Invoice } from "../../../types/invoice";
import type { Project } from "../../../types/project";
import {
  DEMO_INVOICE_COUNT,
  invoiceStatusColor,
  invoiceStatusLabel,
} from "../constants/invoicingConstants";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoicePdfPreviewDialog } from "./InvoicePdfPreviewDialog";

interface InvoicingInvoiceListProps {
  invoices: Invoice[];
  projects: Project[];
}

export function InvoicingInvoiceList({
  invoices,
  projects,
}: InvoicingInvoiceListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);

  const displayed = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, DEMO_INVOICE_COUNT),
    [invoices],
  );

  const getProjectCode = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.projectCode ?? invoiceProjectName(projectId, invoices);
  };

  const openDraftModal = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice);
    setModalOpen(true);
  }, []);

  const openPdfPreview = useCallback((invoice: Invoice) => {
    setPreviewInvoice(invoice);
    setPdfPreviewOpen(true);
  }, []);

  const handleInvoiceClick = useCallback(
    (invoice: Invoice) => {
      const status = resolveInvoiceStatus(invoice);
      if (status === "draft") {
        openDraftModal(invoice);
        return;
      }
      openPdfPreview(invoice);
    },
    [openDraftModal, openPdfPreview],
  );

  const handleNewInvoice = useCallback(() => {
    setEditingInvoice(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingInvoice(null);
  }, []);

  const handleClosePdfPreview = useCallback(() => {
    setPdfPreviewOpen(false);
    setPreviewInvoice(null);
  }, []);

  const handleSaved = useCallback(() => {
    setModalOpen(false);
    setEditingInvoice(null);
  }, []);

  const handleSent = useCallback(() => {
    setModalOpen(false);
    setEditingInvoice(null);
  }, []);

  return (
    <>
      <CreateInvoiceModal
        open={modalOpen}
        projects={projects}
        invoice={editingInvoice}
        onClose={handleCloseModal}
        onSaved={handleSaved}
        onSent={handleSent}
      />
      <InvoicePdfPreviewDialog
        open={pdfPreviewOpen}
        invoice={previewInvoice}
        onClose={handleClosePdfPreview}
      />
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <FileText size={18} />
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>
            Invoices
          </Typography>
          <Chip
            label={displayed.length}
            size="small"
            sx={{ height: 22, fontSize: "0.75rem" }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={18} />}
            onClick={handleNewInvoice}
            sx={{
              flexShrink: 0,
              alignSelf: { xs: "stretch", sm: "flex-start" },
              marginLeft: "auto",
              marginRight: 1,
            }}
          >
            New Invoice
          </Button>
        </Box>

        {displayed.length === 0 ? (
          <Box
            sx={{
              py: 6,
              textAlign: "center",
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "#E8F5E9",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
              No invoices yet. Click &quot;New Invoice&quot; to create one.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
              overflowX: "auto",
            }}
          >
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: "#1e3a5f" }}>
                  {[
                    "Status",
                    "Invoice #",
                    "Created",
                    "Due",
                    "Client",
                    "Project",
                    "Milestone",
                    "Total",
                    "Actions",
                  ].map((col) => (
                    <TableCell
                      key={col}
                      align={col === "Total" ? "right" : "left"}
                      sx={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: "0.75rem",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {displayed.map((invoice) => {
                  const status = resolveInvoiceStatus(invoice);
                  const colors = invoiceStatusColor(status);

                  return (
                    <TableRow
                      key={invoice.id}
                      hover
                      onClick={() => handleInvoiceClick(invoice)}
                      sx={{ cursor: "pointer" }}
                    >
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
                      <TableCell
                        sx={{
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "primary.main",
                        }}
                      >
                        {invoice.invoiceNumber}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}
                      >
                        {formatInvoiceDate(invoice.invoiceDate)}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.8125rem", whiteSpace: "nowrap" }}
                      >
                        {formatInvoiceDate(invoice.dueDate)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8125rem" }}>
                        {invoice.billToName}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8125rem" }}>
                        {getProjectCode(invoice.projectId)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8125rem" }}>
                        {invoice.milestoneName}
                      </TableCell>
                      <TableCell
                        sx={{ fontSize: "0.8125rem", fontWeight: 600 }}
                        align="right"
                      >
                        {formatInvoiceCurrency(invoice.totalDue)}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8125rem" }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInvoiceClick(invoice);
                          }}
                          aria-label={
                            status === "draft"
                              ? `Edit invoice ${invoice.invoiceNumber}`
                              : `Preview invoice ${invoice.invoiceNumber}`
                          }
                        >
                          <Eye size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </>
  );
}

function invoiceProjectName(projectId: string, invoices: Invoice[]): string {
  const inv = invoices.find((i) => i.projectId === projectId);
  return inv?.projectName ?? "—";
}
