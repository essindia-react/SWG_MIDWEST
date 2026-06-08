import { useEffect, useState } from "react";
import { Box, Button, Grid, IconButton, Typography } from "@mui/material";
import { Paperclip, Plus, Trash2, Upload } from "lucide-react";

const DOCUMENT_CATEGORIES = [
  "Customer Documents",
  "Design Documents",
  "Proposal Documents",
] as const;

type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

const DEFAULT_ITEMS: Record<DocumentCategory, string[]> = {
  "Customer Documents": ["Customer ID Proof", "Contract Draft"],
  "Design Documents": ["Design ID Proof", "Contract Draft"],
  "Proposal Documents": ["Proposal ID Proof", "Contract Draft"],
};

const DEFAULT_COUNTS: Record<DocumentCategory, number> = {
  "Customer Documents": DEFAULT_ITEMS["Customer Documents"].length,
  "Design Documents": DEFAULT_ITEMS["Design Documents"].length,
  "Proposal Documents": DEFAULT_ITEMS["Proposal Documents"].length,
};

interface DocumentsStepProps {
  onCountChange?: (count: number) => void;
}

function UploadSlot({
  label,
  removable,
  onRemove,
}: {
  label: string;
  removable: boolean;
  onRemove: () => void;
}) {
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.primary" }}>
          {label}
        </Typography>
        {removable && (
          <IconButton size="small" onClick={onRemove} aria-label={`Remove ${label}`} sx={{ p: 0.5 }}>
            <Trash2 size={14} color="#DC2626" />
          </IconButton>
        )}
      </Box>
      <Box
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
          Click or drag file to upload
        </Typography>
      </Box>
    </Box>
  );
}

export function DocumentsStep({ onCountChange }: DocumentsStepProps) {
  const [categoryItems, setCategoryItems] = useState(DEFAULT_ITEMS);

  const totalCount = DOCUMENT_CATEGORIES.reduce(
    (sum, cat) => sum + categoryItems[cat].length,
    0
  );

  useEffect(() => {
    onCountChange?.(totalCount);
  }, [totalCount, onCountChange]);

  const handleAddMore = (category: DocumentCategory) => {
    setCategoryItems((prev) => {
      const count = prev[category].length + 1;
      return {
        ...prev,
        [category]: [...prev[category], `Additional Document ${count}`],
      };
    });
  };

  const handleRemove = (category: DocumentCategory, index: number) => {
    if (index < DEFAULT_COUNTS[category]) return;
    setCategoryItems((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  return (
    <Grid container spacing={3}>
      {DOCUMENT_CATEGORIES.map((cat) => (
        <Grid key={cat} size={{ xs: 12, md: 4 }}>
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
              {categoryItems[cat].map((item, index) => (
                <UploadSlot
                  key={`${cat}-${item}-${index}`}
                  label={item}
                  removable={index >= DEFAULT_COUNTS[cat]}
                  onRemove={() => handleRemove(cat, index)}
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
  );
}
