import { useRef } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import { FileText, Trash2, Upload } from "lucide-react";

export interface UploadedImage {
  id: string;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
}

interface ImageUploadFieldProps {
  label?: string;
  image?: UploadedImage;
  onUpload: (file: File) => void;
  onRemove?: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageUploadField({ label, image, onUpload, onRemove }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePick = () => inputRef.current?.click();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
    e.target.value = "";
  };

  return (
    <Box>
      {label && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.primary" }}>
            {label}
          </Typography>
          {image && onRemove && (
            <IconButton size="small" onClick={onRemove} aria-label={`Remove ${label}`} sx={{ p: 0.5 }}>
              <Trash2 size={14} color="#DC2626" />
            </IconButton>
          )}
        </Box>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        style={{ display: "none" }}
        onChange={handleChange}
      />

      {image ? (
        <Box
          onClick={handlePick}
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
              {image.fileName}
            </Typography>
            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
              {formatFileSize(image.fileSize)} · Click to replace
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={handlePick}
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
          }}
        >
          <Upload size={24} color="#94A3B8" />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            Click to upload image
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export function fileToUploadedImage(file: File): UploadedImage {
  return {
    id: `img-${Date.now()}`,
    fileName: file.name,
    fileSize: file.size,
    uploadedAt: new Date().toISOString(),
  };
}
