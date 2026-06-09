import { useRef, useState } from "react";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { FileText, Paperclip, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { LeadUploadedDocument } from "../../../../types/lead";
import { WorkspaceSection } from "./WorkspaceSection";
import { SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const DOCUMENT_TYPES = [
  "Customer ID Proof",
  "Design Drawing",
  "Contract Draft",
  "Proposal Document",
  "Site Photos",
  "Invoice",
  "Other",
] as const;

interface DocumentsStepProps {
  values: WorkspaceFormValues;
  onChange: WorkspaceFormChange;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentsStep({ values, onChange }: DocumentsStepProps) {
  const [documentType, setDocumentType] = useState<string>(DOCUMENT_TYPES[0]);
  const inputRef = useRef<HTMLInputElement>(null);

  const customerName = `${values.firstName} ${values.lastName}`.trim() || values.estimationCustomerName;
  const customerId = values.existingCustomerId || values.leadNo;

  const handleUpload = (file: File) => {
    if (!documentType) {
      toast.error("Select a document type first");
      return;
    }
    const doc: LeadUploadedDocument = {
      id: `doc-${Date.now()}`,
      documentType,
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
    };
    const next = [...values.uploadedDocuments, doc];
    onChange("uploadedDocuments", next);
    onChange("documentCount", next.length);
    toast.success(`${documentType} uploaded successfully`);
  };

  const handleRemove = (id: string) => {
    const next = values.uploadedDocuments.filter((d) => d.id !== id);
    onChange("uploadedDocuments", next);
    onChange("documentCount", next.length);
  };

  return (
    <WorkspaceSection title="Documents">
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldInput label="Customer Name" value={customerName} onChange={() => {}} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextFieldInput label="Customer ID" value={customerId} onChange={() => {}} disabled />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SelectField
            label="Document Type"
            value={documentType}
            onChange={setDocumentType}
            options={DOCUMENT_TYPES}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,.pdf"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = "";
            }}
          />
          <Box
            onClick={() => inputRef.current?.click()}
            sx={{
              border: 2,
              borderStyle: "dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              bgcolor: "grey.50",
              cursor: "pointer",
              maxWidth: 400,
              "&:hover": { bgcolor: "background.paper", borderColor: "primary.main" },
            }}
          >
            <Upload size={28} color="#94A3B8" />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Upload {documentType || "document"}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Click to select image or PDF
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {values.uploadedDocuments.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Paperclip size={16} color="#2E7D32" />
            Uploaded Documents ({values.uploadedDocuments.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {values.uploadedDocuments.map((doc) => (
              <Box
                key={doc.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    bgcolor: "#E8F5E9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <FileText size={20} color="#2E7D32" />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }} noWrap>
                    {doc.fileName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                    {doc.documentType} · {formatFileSize(doc.fileSize)}
                  </Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleRemove(doc.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </WorkspaceSection>
  );
}
