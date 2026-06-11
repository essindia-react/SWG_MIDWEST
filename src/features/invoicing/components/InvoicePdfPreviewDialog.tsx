import React from "react";
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@mui/material";
import { X } from "lucide-react";
import invoiceTemplateUrl from "../../../assets/SWG_Invoice_Template.pdf";
import type { Invoice } from "../../../types/invoice";

interface InvoicePdfPreviewDialogProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
}

export function InvoicePdfPreviewDialog({
  open,
  invoice,
  onClose,
}: InvoicePdfPreviewDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "90vw",
          height: "92vh",
          maxWidth: "1400px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
          pr: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
            Invoice Preview
          </Typography>
          {invoice && (
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              {invoice.invoiceNumber} · {invoice.milestoneName}
            </Typography>
          )}
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close preview">
          <X size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, height: "calc(92vh - 64px)" }}>
        <Box
          component="iframe"
          src={invoiceTemplateUrl}
          title="SWG Invoice Template"
          sx={{ width: "100%", height: "100%", border: "none", display: "block" }}
        />
      </DialogContent>
    </Dialog>
  );
}
