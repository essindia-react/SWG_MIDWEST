import React, { useRef, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { FileText, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { formatProjectDate } from "../../../../lib/projectHelpers";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import type { FieldGuideDocument, FieldOperations } from "../../../../types/project";
import {
  CURRENT_USER_NAME,
  FIELD_DOCUMENT_TYPES,
} from "../../constants/fieldOperationsConstants";

interface FieldDocumentsGuidesTabProps {
  fieldOps: FieldOperations;
  onFieldOpsChange: (updates: Partial<FieldOperations>) => void;
}

export function FieldDocumentsGuidesTab({
  fieldOps,
  onFieldOpsChange,
}: FieldDocumentsGuidesTabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    documentType: FIELD_DOCUMENT_TYPES[0],
    description: "",
    fileNames: [] as string[],
  });

  const handleFilePick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const names = Array.from(files).map((file) => file.name);
    setForm((prev) => ({ ...prev, fileNames: [...prev.fileNames, ...names] }));
    event.target.value = "";
  };

  const addDocument = () => {
    if (form.fileNames.length === 0) {
      toast.error("Upload at least one file");
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    const newDoc: FieldGuideDocument = {
      id: `fgd-${Date.now()}`,
      documentType: form.documentType,
      fileNames: form.fileNames,
      description: form.description,
      uploadDate: today,
      uploadedBy: CURRENT_USER_NAME,
    };

    onFieldOpsChange({
      guideDocuments: [...fieldOps.guideDocuments, newDoc],
    });

    setForm({
      documentType: FIELD_DOCUMENT_TYPES[0],
      description: "",
      fileNames: [],
    });
    toast.success("Document added");
  };

  const removeDocument = (id: string) => {
    onFieldOpsChange({
      guideDocuments: fieldOps.guideDocuments.filter((doc) => doc.id !== id),
    });
  };

  return (
    <Box>
      <WorkspaceSection title="Upload Documents & Guides">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SelectField
              label="Document Type"
              value={form.documentType}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  documentType: value as typeof form.documentType,
                }))
              }
              options={FIELD_DOCUMENT_TYPES}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextFieldInput
              label="Description"
              value={form.description}
              onChange={(value) => setForm((prev) => ({ ...prev, description: value }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              hidden
              onChange={handleFilePick}
            />
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                bgcolor: "grey.50",
                "&:hover": { borderColor: "primary.main", bgcolor: "rgba(46,125,50,0.04)" },
              }}
            >
              <Upload size={24} color="#2E7D32" style={{ margin: "0 auto 8px" }} />
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                Multi-file upload supported
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5 }}>
                Click to select files
              </Typography>
              {form.fileNames.length > 0 && (
                <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                  {form.fileNames.map((name) => (
                    <Box
                      key={name}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: "#E8F5E9",
                        fontSize: "0.75rem",
                        color: "#2E7D32",
                      }}
                    >
                      {name}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addDocument}>
              Add Document
            </Button>
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Uploaded Documents">
        {fieldOps.guideDocuments.length === 0 ? (
          <Typography sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}>
            No field documents uploaded yet.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell>Files</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Upload Date</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldOps.guideDocuments.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{doc.documentType}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <FileText size={14} color="#2E7D32" />
                      {doc.fileNames.join(", ")}
                    </Box>
                  </TableCell>
                  <TableCell>{doc.description || "—"}</TableCell>
                  <TableCell>{formatProjectDate(doc.uploadDate)}</TableCell>
                  <TableCell>{doc.uploadedBy}</TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={() => removeDocument(doc.id)}>
                      <Trash2 size={16} color="#DC2626" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </WorkspaceSection>
    </Box>
  );
}
