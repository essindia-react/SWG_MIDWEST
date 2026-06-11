import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FileText, X } from "lucide-react";
import { toast } from "sonner";
import { useInvoices } from "../../../hooks/useInvoices";
import {
  buildLineItems,
  calculateDueDate,
  formatInvoiceCurrency,
  formatInvoiceDate,
  getAmountPreviouslyPaid,
} from "../../../lib/invoiceHelpers";
import type {
  Invoice,
  MilestoneCompletionRecord,
  PaymentMethod,
  PaymentTerm,
} from "../../../types/invoice";
import type { Project, ProjectMilestone } from "../../../types/project";
import {
  DEFAULT_NOTES_TO_CLIENT,
  DEFAULT_TAX_PERCENT,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_TERM_OPTIONS,
} from "../constants/invoicingConstants";
import {
  MultiSelectField,
  SelectField,
  TextFieldInput,
} from "../../leads/components/workspace/workspaceFields";

interface CreateInvoiceFormProps {
  project: Project;
  milestone: ProjectMilestone;
  completionRecord: MilestoneCompletionRecord;
  invoice: Invoice | null;
  variant?: "inline" | "modal";
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
  onSent: (invoice: Invoice) => void;
}

export function CreateInvoiceForm({
  project,
  milestone,
  completionRecord,
  invoice,
  variant = "inline",
  onClose,
  onSaved,
  onSent,
}: CreateInvoiceFormProps) {
  const { invoices, createInvoice, updateInvoice, updateInvoiceStatus } =
    useInvoices();

  const [taxPercent, setTaxPercent] = useState(
    String(invoice?.taxPercent ?? DEFAULT_TAX_PERCENT),
  );
  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm>(
    invoice?.paymentTerms ?? "Net 15",
  );
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(
    invoice?.paymentMethods ?? ["ACH", "Check"],
  );
  const [notesToClient, setNotesToClient] = useState(
    invoice?.notesToClient ?? DEFAULT_NOTES_TO_CLIENT,
  );
  const [internalNotes, setInternalNotes] = useState(
    invoice?.internalNotes ?? "",
  );

  const previewLineItems = useMemo(
    () => buildLineItems(project, milestone),
    [project, milestone],
  );

  const previewSubtotal = previewLineItems.reduce(
    (sum, li) => sum + li.amount,
    0,
  );
  const previewTax =
    Math.round(previewSubtotal * (Number(taxPercent) / 100) * 100) / 100;
  const previewTotal = Math.round((previewSubtotal + previewTax) * 100) / 100;
  const previewPreviouslyPaid = getAmountPreviouslyPaid(
    project.id,
    milestone.id,
    invoices,
  );
  const previewBalance = Math.max(0, previewTotal - previewPreviouslyPaid);

  const lineItems = invoice?.lineItems ?? previewLineItems;
  const subtotal = invoice?.subtotal ?? previewSubtotal;
  const taxAmount = invoice?.taxAmount ?? previewTax;
  const totalDue = invoice?.totalDue ?? previewTotal;
  const amountPreviouslyPaid =
    invoice?.amountPreviouslyPaid ?? previewPreviouslyPaid;
  const balanceRemaining = invoice?.balanceRemaining ?? previewBalance;

  const buildInput = () => ({
    projectId: project.id,
    milestoneId: milestone.id,
    taxPercent: Number(taxPercent) || 0,
    paymentTerms,
    paymentMethods: [...paymentMethods],
    notesToClient,
    internalNotes,
    completionRecord: { ...completionRecord, completionPct: 100 },
  });

  const applyDraftUpdates = (draft: Invoice): Invoice => {
    const input = buildInput();
    const lineItems =
      draft.lineItems.length > 0
        ? draft.lineItems
        : buildLineItems(project, milestone);
    const subtotal = lineItems.reduce((sum, li) => sum + li.amount, 0);
    const tax = Math.round(subtotal * (input.taxPercent / 100) * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    const previouslyPaid = getAmountPreviouslyPaid(
      project.id,
      milestone.id,
      invoices.filter((inv) => inv.id !== draft.id),
    );
    const balance = Math.max(
      0,
      Math.round((total - previouslyPaid) * 100) / 100,
    );

    const updates = {
      taxPercent: input.taxPercent,
      paymentTerms: input.paymentTerms,
      paymentMethods: input.paymentMethods,
      notesToClient: input.notesToClient,
      internalNotes: input.internalNotes,
      completionRecord: input.completionRecord,
      lineItems,
      subtotal,
      taxAmount: tax,
      totalDue: total,
      amountPreviouslyPaid: previouslyPaid,
      balanceRemaining: balance,
      dueDate: calculateDueDate(draft.invoiceDate, input.paymentTerms),
    };

    updateInvoice(draft.id, updates);
    return { ...draft, ...updates };
  };

  const handleSaveDraft = () => {
    const input = buildInput();

    if (invoice?.status === "draft") {
      const updated = applyDraftUpdates(invoice);
      onSaved(updated);
      onClose();
      toast.success(`Invoice ${invoice.invoiceNumber} saved as draft`);
      return;
    }

    if (invoice?.status === "sent") {
      onSaved(invoice);
      onClose();
      toast.success(`Invoice ${invoice.invoiceNumber} saved`);
      return;
    }

    const created = createInvoice(input);
    if (created) {
      onSaved(created);
      onClose();
      toast.success(`Invoice ${created.invoiceNumber} saved as draft`);
    }
  };

  const handleSendInvoice = () => {
    let target = invoice;

    if (!target) {
      target = createInvoice(buildInput());
      if (!target) return;
    } else if (target.status === "draft") {
      target = applyDraftUpdates(target);
    }

    updateInvoiceStatus(target.id, "sent");
    const sentInvoice = { ...target, status: "sent" as const };
    onSent(sentInvoice);
    onClose();
    toast.success(
      `Invoice ${target.invoiceNumber} sent to ${target.billToEmail}`,
    );
  };

  const handlePreview = () => {
    if (invoice) {
      toast.info(
        `Previewing invoice ${invoice.invoiceNumber} — PDF preview would open here`,
      );
      return;
    }
    toast.info("Save as draft first to preview the invoice");
  };

  const isModal = variant === "modal";

  return (
    <Box
      sx={{
        ...(isModal
          ? {}
          : {
              borderTop: 2,
              borderColor: "primary.main",
              pt: 3,
              mt: 2,
            }),
      }}
    >
      {!isModal && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2.5,
          }}
        >
          <Box>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
              Invoice Creation
            </Typography>
            <Typography
              sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}
            >
              Review and edit invoice details before sending to client
            </Typography>
          </Box>
          <Button
            variant="text"
            color="inherit"
            size="small"
            startIcon={<X size={16} />}
            onClick={onClose}
            sx={{ flexShrink: 0 }}
          >
            Close
          </Button>
        </Box>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldInput
            label="Invoice #"
            value={invoice?.invoiceNumber ?? "Auto-generated on save"}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldInput
            label="Invoice Date"
            value={formatInvoiceDate(
              invoice?.invoiceDate ?? new Date().toISOString().slice(0, 10),
            )}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldInput
            label="Due Date"
            value={formatInvoiceDate(invoice?.dueDate ?? "")}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <SelectField
            label="Payment Terms"
            value={paymentTerms}
            onChange={(v) => setPaymentTerms(v as PaymentTerm)}
            options={PAYMENT_TERM_OPTIONS}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldInput
            label="Bill To — Name"
            value={project.customerName}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextFieldInput
            label="Bill To — Email"
            value={invoice?.billToEmail ?? ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldInput
            label="Bill To — Address"
            value={invoice?.billToAddress ?? ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
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
            label="Job Site Address"
            value={invoice?.jobSiteAddress ?? ""}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldInput
            label="Milestone Name"
            value={milestone.name}
            onChange={() => {}}
            disabled
          />
        </Grid>
      </Grid>

      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1 }}>
        Line Items
      </Typography>
      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 1.5,
          overflow: "hidden",
          mb: 2.5,
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">
                Amount ($)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineItems.map((li) => (
              <TableRow key={li.id}>
                <TableCell sx={{ fontSize: "0.8125rem" }}>
                  {li.description}
                </TableCell>
                <TableCell sx={{ fontSize: "0.8125rem" }} align="right">
                  {formatInvoiceCurrency(li.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextFieldInput
            label="Subtotal ($)"
            value={formatInvoiceCurrency(subtotal)}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextFieldInput
            label="Tax (%)"
            value={taxPercent}
            onChange={setTaxPercent}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextFieldInput
            label="Tax Amount ($)"
            value={formatInvoiceCurrency(taxAmount)}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextFieldInput
            label="Total Due ($)"
            value={formatInvoiceCurrency(totalDue)}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextFieldInput
            label="Amount Previously Paid ($)"
            value={formatInvoiceCurrency(amountPreviouslyPaid)}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextFieldInput
            label="Balance Remaining ($)"
            value={formatInvoiceCurrency(balanceRemaining)}
            onChange={() => {}}
            disabled
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <MultiSelectField
            label="Payment Methods Accepted"
            value={paymentMethods}
            onChange={setPaymentMethods}
            options={PAYMENT_METHOD_OPTIONS}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldInput
            label="Notes / Message to Client"
            value={notesToClient}
            onChange={setNotesToClient}
            multiline
            minRows={2}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextFieldInput
            label="Internal Notes"
            value={internalNotes}
            onChange={setInternalNotes}
            multiline
            minRows={2}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
        <Button variant="outlined" onClick={handleSaveDraft}>
          Save as Draft
        </Button>
        <Button variant="contained" color="primary" onClick={handleSendInvoice}>
          Send Invoice
        </Button>
      </Box>
    </Box>
  );
}
