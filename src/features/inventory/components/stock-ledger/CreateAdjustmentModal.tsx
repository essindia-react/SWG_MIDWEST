import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Radio,
  RadioGroup,
  Typography,
} from "@mui/material";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import {
  LabeledSelectField,
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { ADJUSTMENT_REASONS } from "../../constants/inventoryConstants";
import { createAdjustment, getProducts } from "../../lib/inventoryStore";

interface CreateAdjustmentModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateAdjustmentModal({ open, onClose }: CreateAdjustmentModalProps) {
  const products = getProducts().filter((p) => p.inventoryType === "Stocked");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [adjustmentType, setAdjustmentType] = useState<"Increase" | "Decrease">("Increase");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");

  const selectedProduct = products.find((p) => p.id === productId);

  const handleSave = () => {
    if (!productId || !quantity || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    createAdjustment({
      productId,
      adjustmentType,
      quantity: Number(quantity),
      reason,
      comments,
      createdBy: "Maria S.",
    });

    toast.success("Adjustment saved — stock ledger updated");
    setQuantity("");
    setComments("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Inventory Adjustment</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            Product Selection
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12 }}>
              <LabeledSelectField
                label="Product"
                value={productId}
                onChange={setProductId}
                options={products.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              />
              {selectedProduct && (
                <Box sx={{ mt: 1, display: "flex", gap: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    Current: <strong>{selectedProduct.currentStock} {selectedProduct.unit}</strong>
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            Adjustment Type
          </Typography>
          <RadioGroup
            row
            value={adjustmentType}
            onChange={(e) => setAdjustmentType(e.target.value as "Increase" | "Decrease")}
            sx={{ mb: 3 }}
          >
            <FormControlLabel value="Increase" control={<Radio size="small" />} label="Increase" />
            <FormControlLabel value="Decrease" control={<Radio size="small" />} label="Decrease" />
          </RadioGroup>

          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            Adjustment Details
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Adjustment Quantity"
                type="number"
                value={quantity}
                onChange={setQuantity}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Reason"
                value={reason}
                onChange={setReason}
                options={ADJUSTMENT_REASONS}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Comments"
                value={comments}
                onChange={setComments}
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>

          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1.5, color: "text.secondary" }}>
            Attachment
          </Typography>
          <Box
            sx={{
              border: "2px dashed",
              borderColor: "divider",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": { borderColor: "primary.main", bgcolor: "rgba(46,125,50,0.04)" },
            }}
            onClick={() => toast.info("File upload — demo mode")}
          >
            <Upload size={24} color="#9E9E9E" style={{ margin: "0 auto 8px" }} />
            <Typography variant="body2" color="text.secondary">
              Click to upload supporting documents
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          Save Adjustment
        </Button>
      </DialogActions>
    </Dialog>
  );
}
