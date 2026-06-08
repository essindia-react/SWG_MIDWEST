import React, { useMemo, useRef, useState } from "react";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { FileText, Paperclip, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { useConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { formatProjectDate } from "../../../../lib/projectHelpers";
import { SelectField } from "../../../leads/components/workspace/workspaceFields";
import type {
  Project,
  ProjectDocument,
  ProjectDocumentCategory,
} from "../../../../types/project";

const DOCUMENT_CATEGORIES: ProjectDocumentCategory[] = [
  "Pre Site Images and Post",
  "Proof of work",
];

const ATTACHMENT_TYPES = [
  "Site Photos",
  "Design Files",
  "Contracts",
  "Invoices",
  "Other",
] as const;

const DEFAULT_COUNTS: Record<ProjectDocumentCategory, number> = {
  "Pre Site Images and Post": 2,
  "Proof of work": 2,
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadSlot({
  label,
  doc,
  removable,
  onPickFile,
  onRemove,
}: {
  label: string;
  doc: ProjectDocument;
  removable: boolean;
  onPickFile: () => void;
  onRemove: () => void;
}) {
  const uploaded = Boolean(doc.uploaded);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.primary" }}>
          {label}
          {uploaded && (
            <Box
              component="span"
              sx={{
                ml: 1,
                px: 1,
                py: 0.25,
                borderRadius: 999,
                fontSize: "0.625rem",
                bgcolor: "#E8F5E9",
                color: "#2E7D32",
              }}
            >
              Attached
            </Box>
          )}
        </Typography>
        {removable && (
          <IconButton size="small" onClick={onRemove} aria-label={`Remove ${label}`} sx={{ p: 0.5 }}>
            <Trash2 size={14} color="#DC2626" />
          </IconButton>
        )}
      </Box>

      {uploaded && doc.fileName ? (
        <Box
          onClick={onPickFile}
          sx={{
            border: 1,
            borderColor: "primary.main",
            borderRadius: 2,
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            bgcolor: "rgba(46,125,50,0.04)",
            cursor: "pointer",
            "&:hover": { bgcolor: "rgba(46,125,50,0.08)" },
            transition: "all 0.2s",
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
            <Typography
              sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.primary" }}
              noWrap
            >
              {doc.fileName}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
              {doc.fileSize ? formatFileSize(doc.fileSize) : "File"}
              {doc.uploadedAt
                ? ` · Uploaded ${formatProjectDate(doc.uploadedAt.slice(0, 10))}`
                : ""}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: "0.6875rem", color: "primary.main", fontWeight: 600 }}>
            Replace
          </Typography>
        </Box>
      ) : (
        <Box
          onClick={onPickFile}
          sx={{
            border: 2,
            borderStyle: "dashed",
            borderColor: "divider",
            borderRadius: 2,
            p: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
            "&:hover": { bgcolor: "background.paper", borderColor: "primary.main" },
            transition: "all 0.2s",
          }}
        >
          <Upload size={24} color="#94A3B8" />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Click to browse and upload file
          </Typography>
        </Box>
      )}
    </Box>
  );
}

interface ProjectDocumentsTabProps {
  project: Project;
  onDocumentsChange: (documents: ProjectDocument[]) => void;
}

export function ProjectDocumentsTab({ project, onDocumentsChange }: ProjectDocumentsTabProps) {
  const { requestConfirm, confirmDialog } = useConfirmDialog();
  const [attachmentType, setAttachmentType] = useState("");
  const [pendingDocId, setPendingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryItems = useMemo(() => {
    const grouped: Record<ProjectDocumentCategory, ProjectDocument[]> = {
      "Pre Site Images and Post": [],
      "Proof of work": [],
    };
    project.documents.forEach((doc) => {
      grouped[doc.category].push(doc);
    });
    return grouped;
  }, [project.documents]);

  const uploadedDocuments = useMemo(
    () => project.documents.filter((doc) => doc.uploaded && doc.fileName),
    [project.documents]
  );

  const handleAddMore = (category: ProjectDocumentCategory) => {
    const count = categoryItems[category].length + 1;
    onDocumentsChange([
      ...project.documents,
      {
        id: `doc-${Date.now()}`,
        category,
        label: `Additional Document ${count}`,
      },
    ]);
  };

  const handleRemove = (doc: ProjectDocument) => {
    const categoryDocs = categoryItems[doc.category];
    const index = categoryDocs.findIndex((d) => d.id === doc.id);
    if (index < DEFAULT_COUNTS[doc.category]) return;

    requestConfirm({
      title: "Remove Document?",
      description: `Are you sure you want to remove "${doc.label}" from this project? This action cannot be undone.`,
      confirmLabel: "Remove",
      onConfirm: () => {
        onDocumentsChange(project.documents.filter((d) => d.id !== doc.id));
        toast.success("Document removed");
      },
    });
  };

  const openFilePicker = (docId: string) => {
    setPendingDocId(docId);
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingDocId) return;

    const doc = project.documents.find((d) => d.id === pendingDocId);
    if (!doc) return;

    onDocumentsChange(
      project.documents.map((d) =>
        d.id === pendingDocId
          ? {
              ...d,
              uploaded: true,
              uploadedAt: new Date().toISOString(),
              fileName: file.name,
              fileSize: file.size,
            }
          : d
      )
    );
    toast.success(`${file.name} uploaded`);
    setPendingDocId(null);
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        hidden
        accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleFileSelected}
      />

      {/* <Box sx={{ mb: 4, maxWidth: 400 }}>
        <SelectField
          label="Document Attachment"
          value={attachmentType}
          onChange={setAttachmentType}
          options={ATTACHMENT_TYPES}
        />
      </Box> */}

      {uploadedDocuments.length > 0 && (
        <Box
          sx={{
            mb: 2,
            p: 1,
            border: 1,
            borderColor: "primary.main",
            borderRadius: 2,
            bgcolor: "rgba(46,125,50,0.04)",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9375rem",
              fontWeight: 700,
              mb: 2,
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "#2E7D32",
            }}
          >
            <Paperclip size={16} />
            Uploaded Documents ({uploadedDocuments.length})
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {uploadedDocuments.map((doc) => (
              <Box
                key={doc.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <FileText size={18} color="#2E7D32" />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }} noWrap>
                    {doc.fileName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                    {doc.category}
                    {doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ""}
                    {doc.uploadedAt
                      ? ` · ${formatProjectDate(doc.uploadedAt.slice(0, 10))}`
                      : ""}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      <Grid container spacing={3}>
        {DOCUMENT_CATEGORIES.map((cat) => (
          <Grid key={cat} size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 3,
                border: 1,
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "background.paper",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Paperclip size={16} color="#2E7D32" />
                {cat}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                {categoryItems[cat].map((doc, index) => (
                  <UploadSlot
                    key={doc.id}
                    label={doc.label}
                    doc={doc}
                    removable={index >= DEFAULT_COUNTS[cat]}
                    onPickFile={() => openFilePicker(doc.id)}
                    onRemove={() => handleRemove(doc)}
                  />
                ))}
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Plus size={14} />}
                onClick={() => handleAddMore(cat)}
                sx={{ mt: 2, width: "100%" }}
              >
                Add More
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
      {confirmDialog}
    </>
  );
}
