import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  ThemeProvider,
  Typography,
} from "@mui/material";
import { ArrowRight, Download, Eye, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "../../../components/ui/ConfirmDialog";
import { useInvoices } from "../../../hooks/useInvoices";
import {
  getMilestoneCompletionPct,
  isChecklistComplete,
  resolveInvoiceStatus,
} from "../../../lib/invoiceHelpers";
import { theme } from "../../../theme/theme";
import type {
  Invoice,
  MilestoneCompletionRecord,
} from "../../../types/invoice";
import type { Project, ProjectMilestone } from "../../../types/project";
import { DEPARTMENT_CHECKLIST_ITEMS } from "../constants/invoicingConstants";
import { CreateInvoiceForm } from "./CreateInvoiceForm";
import { InvoiceDraftList } from "./InvoiceDraftList";
import { InvoiceStatusFlow } from "./InvoiceStatusFlow";
import { TextFieldInput } from "../../leads/components/workspace/workspaceFields";

interface InvoicingMilestonePanelProps {
  project: Project;
  milestone: ProjectMilestone;
  onClose: () => void;
}

function createDefaultChecklist(): Record<string, boolean> {
  return Object.fromEntries(
    DEPARTMENT_CHECKLIST_ITEMS.map((item) => [item, false]),
  );
}

function SectionHeading({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography
          sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}

export function InvoicingMilestonePanel({
  project,
  milestone,
  onClose,
}: InvoicingMilestonePanelProps) {
  const { getInvoicesForMilestone } = useInvoices();
  const { requestConfirm, confirmDialog } = useConfirmDialog();
  const [isVisible, setIsVisible] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [formInvoice, setFormInvoice] = useState<Invoice | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingInvoice = getInvoicesForMilestone(
    project.id,
    milestone.id,
  ).find((inv) => resolveInvoiceStatus(inv) !== "draft");
  const milestoneDrafts = getInvoicesForMilestone(
    project.id,
    milestone.id,
  ).filter((inv) => resolveInvoiceStatus(inv) === "draft");
  const completionPct = getMilestoneCompletionPct(milestone);

  const [completionRecord, setCompletionRecord] =
    useState<MilestoneCompletionRecord>(() => ({
      completionPct,
      markedCompleteBy: milestone.assignedTo || project.projectManager,
      completionDate: new Date().toISOString().slice(0, 10),
      completionPhotos:
        existingInvoice?.completionRecord.completionPhotos ?? [],
      checklistSignedOff:
        existingInvoice?.completionRecord.checklistSignedOff ??
        createDefaultChecklist(),
    }));

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  useEffect(() => {
    setCompletionRecord((prev) => ({ ...prev, completionPct }));
  }, [completionPct]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const handleCloseInvoiceForm = useCallback(() => {
    setShowInvoiceForm(false);
    setFormInvoice(null);
  }, []);

  const displayStatus = activeInvoice
    ? resolveInvoiceStatus(activeInvoice)
    : existingInvoice
      ? resolveInvoiceStatus(existingInvoice)
      : null;

  const handlePhotoUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const names = Array.from(files).map((f) => f.name);
    setCompletionRecord((prev) => ({
      ...prev,
      completionPhotos: [...prev.completionPhotos, ...names],
    }));
    toast.success(`${names.length} photo(s) attached`);
  };

  const handleCreateInvoiceClick = () => {
    if (completionPct < 100) {
      toast.error("Milestone must be 100% complete to generate an invoice");
      return;
    }
    if (!isChecklistComplete(completionRecord.checklistSignedOff)) {
      toast.error("Department checklist must be complete before invoicing");
      return;
    }
    if (completionRecord.completionPhotos.length === 0) {
      toast.error("Please upload completion photos as evidence of work done");
      return;
    }

    if (existingInvoice) {
      requestConfirm({
        title: "Create New Invoice?",
        description: `An invoice (${existingInvoice.invoiceNumber}) already exists for this milestone. Do you want to create a new invoice? The existing invoice will remain on record.`,
        confirmLabel: "Create New Invoice",
        destructive: false,
        onConfirm: () => {
          setFormInvoice(null);
          setShowInvoiceForm(true);
        },
      });
      return;
    }

    setFormInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleViewInvoice = () => {
    if (!existingInvoice) return;
    setFormInvoice(existingInvoice);
    setShowInvoiceForm(true);
  };

  const handleDraftClick = (draft: Invoice) => {
    setFormInvoice(draft);
    setActiveInvoice(draft);
    setShowInvoiceForm(true);
    setCompletionRecord(draft.completionRecord);
  };

  const handleDownload = () => {
    if (!existingInvoice) return;
    toast.success(`Downloading invoice ${existingInvoice.invoiceNumber}.pdf`);
  };

  const handleInvoiceSaved = (invoice: Invoice) => {
    setActiveInvoice(invoice);
  };

  const handleInvoiceSent = (invoice: Invoice) => {
    setActiveInvoice(invoice);
  };

  const currentInvoice =
    activeInvoice ?? existingInvoice ?? milestoneDrafts[0] ?? null;

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        pointerEvents: isVisible ? "auto" : "none",
      }}
    >
      <Box
        onClick={handleClose}
        sx={{
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.35)",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.28s ease",
        }}
      />

      <ThemeProvider theme={theme}>
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            width: "100%",
            maxWidth: { md: "min(1000px, 100%)" },
            display: "flex",
            flexDirection: "column",
            bgcolor: "background.paper",
            boxShadow: "-8px 0 32px rgba(0,0,0,0.15)",
            transform: isVisible ? "translateX(0)" : "translateX(100%)",
            transition: "transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              px: 2,
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{
                  backgroundColor: "white",
                  transition: "box-shadow 0.1s ease",
                  "&:hover": {
                    backgroundColor: "white",
                    boxShadow:
                      "inset 2px 2px 4px rgba(0,0,0,0.15), inset -2px -2px 4px rgba(255,255,255,0.8)",
                  },
                }}
                className="absolute -translate-x-[100%]"
              >
                <ArrowRight size={20} />
              </IconButton>
              <Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, fontSize: "1.0625rem" }}
                >
                  {milestone.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.projectCode} · {project.customerName}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <X size={20} />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: { xs: 2, md: 4 } }}>
            {/* <SectionHeading
              title="Invoice Status Tracking"
              subtitle="Invoice lifecycle flow from draft through payment"
            />
            <InvoiceStatusFlow
              currentStatus={displayStatus}
              invoiceNumber={currentInvoice?.invoiceNumber}
            /> */}

            <SectionHeading
              title="Milestone Completion"
              subtitle="Complete milestone details before generating an invoice"
            />
            <Grid container spacing={2.5} sx={{ mb: 3 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="Project Name"
                  value={project.projectCode}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="Milestone Name"
                  value={milestone.name}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldInput
                  label="Completion %"
                  value={String(completionPct)}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldInput
                  label="Marked Complete By"
                  value={completionRecord.markedCompleteBy}
                  onChange={(v) =>
                    setCompletionRecord((p) => ({ ...p, markedCompleteBy: v }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextFieldInput
                  label="Completion Date"
                  type="date"
                  value={completionRecord.completionDate}
                  onChange={(v) =>
                    setCompletionRecord((p) => ({ ...p, completionDate: v }))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1 }}
                >
                  Completion Photos
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={(e) => handlePhotoUpload(e.target.files)}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Upload size={14} />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Photos
                </Button>
                {completionRecord.completionPhotos.length > 0 && (
                  <Box
                    sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 0.5 }}
                  >
                    {completionRecord.completionPhotos.map((name) => (
                      <Typography
                        key={name}
                        sx={{ fontSize: "0.75rem", color: "primary.main" }}
                      >
                        {name}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Typography
                  sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1 }}
                >
                  Checklist Signed Off
                </Typography>
                <Box
                  sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                >
                  {DEPARTMENT_CHECKLIST_ITEMS.map((item) => (
                    <FormControlLabel
                      key={item}
                      control={
                        <Checkbox
                          size="small"
                          checked={
                            completionRecord.checklistSignedOff[item] ?? false
                          }
                          onChange={(e) =>
                            setCompletionRecord((p) => ({
                              ...p,
                              checklistSignedOff: {
                                ...p.checklistSignedOff,
                                [item]: e.target.checked,
                              },
                            }))
                          }
                        />
                      }
                      label={
                        <Typography sx={{ fontSize: "0.8125rem" }}>
                          {item}
                        </Typography>
                      }
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1.5,
                mb: showInvoiceForm ? 0 : 4,
              }}
            >
              {existingInvoice ? (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Eye size={16} />}
                    onClick={handleViewInvoice}
                  >
                    View Invoice
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<Download size={16} />}
                    onClick={handleDownload}
                  >
                    Download
                  </Button>
                </>
              ) : null}
              <Button
                variant="contained"
                color="primary"
                startIcon={<Plus size={16} />}
                onClick={handleCreateInvoiceClick}
              >
                {existingInvoice ? "Create Invoice" : "Generate Invoice"}
              </Button>
            </Box>

            {showInvoiceForm && (
              <CreateInvoiceForm
                project={project}
                milestone={milestone}
                completionRecord={completionRecord}
                invoice={formInvoice}
                onClose={handleCloseInvoiceForm}
                onSaved={handleInvoiceSaved}
                onSent={handleInvoiceSent}
              />
            )}

            <InvoiceDraftList
              invoices={milestoneDrafts}
              projects={[project]}
              onDraftClick={handleDraftClick}
              selectedDraftId={
                formInvoice?.status === "draft" ? formInvoice.id : undefined
              }
            />
          </Box>
        </Box>
      </ThemeProvider>
      {confirmDialog}
    </Box>
  );
}
