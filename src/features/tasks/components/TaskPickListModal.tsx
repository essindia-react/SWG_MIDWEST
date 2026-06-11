import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useIsMobile } from "../../../components/layout/Sidebar";
import { INVENTORY_ITEMS } from "../../projects/constants/budgetConstants";
import { TASK_PICK_LIST_UNITS } from "../constants/taskManagementConstants";
import type {
  TaskManagementPickListFormData,
  TaskManagementPickListItem,
} from "../types/taskManagementPickList";

const emptyForm: TaskManagementPickListFormData = {
  fieldName: "",
  itemName: "",
  sku: "",
  quantityRequired: "",
  unit: "sq ft",
  pulledFromInventory: false,
  notes: "",
};

interface TaskPickListModalProps {
  open: boolean;
  item?: TaskManagementPickListItem | null;
  onClose: () => void;
  onSave: (data: TaskManagementPickListFormData) => void;
}

export function TaskPickListModal({ open, item, onClose, onSave }: TaskPickListModalProps) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState<TaskManagementPickListFormData>(emptyForm);

  useEffect(() => {
    if (open) {
      if (item) {
        setForm({
          fieldName: item.fieldName,
          itemName: item.itemName,
          sku: item.sku,
          quantityRequired: String(item.quantityRequired),
          unit: item.unit,
          pulledFromInventory: item.pulledFromInventory,
          notes: item.notes,
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [open, item]);

  const handleItemChange = (itemName: string) => {
    const inventoryItem = INVENTORY_ITEMS.find((i) => i.name === itemName);
    setForm((prev) => ({
      ...prev,
      itemName,
      sku: inventoryItem?.sku ?? "",
      unit: inventoryItem?.unit ?? prev.unit,
    }));
  };

  const handleSubmit = () => {
    if (!form.fieldName.trim() || !form.itemName.trim()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {item ? "Edit Pick List Item" : "Add Pick List Item"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Field Name"
            value={form.fieldName}
            onChange={(e) => setForm((prev) => ({ ...prev, fieldName: e.target.value }))}
            placeholder="e.g. Turf Installation Area"
            fullWidth
            size="small"
            required
          />

          <TextField
            select
            label="Item Name"
            value={form.itemName}
            onChange={(e) => handleItemChange(e.target.value)}
            fullWidth
            size="small"
            required
            helperText="From materials list"
          >
            <MenuItem value="">Select material...</MenuItem>
            {INVENTORY_ITEMS.map((inv) => (
              <MenuItem key={inv.sku} value={inv.name}>
                {inv.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="SKU"
            value={form.sku}
            InputProps={{ readOnly: true }}
            fullWidth
            size="small"
            helperText="Auto-filled from material selection"
          />

          <TextField
            label="Quantity Required"
            type="number"
            value={form.quantityRequired}
            onChange={(e) => setForm((prev) => ({ ...prev, quantityRequired: e.target.value }))}
            fullWidth
            size="small"
            inputProps={{ min: 0, step: "any" }}
            helperText="Enter quantity for this field"
          />

          <TextField
            select
            label="Unit"
            value={form.unit}
            onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
            fullWidth
            size="small"
          >
            {TASK_PICK_LIST_UNITS.map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Switch
                checked={form.pulledFromInventory}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, pulledFromInventory: e.target.checked }))
                }
                color="primary"
              />
            }
            label="Pulled from Inventory"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5, ml: 1 }}>
            Updates inventory on confirmation when saved
          </Typography>

          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Any substitution notes"
            fullWidth
            size="small"
            multiline
            rows={3}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={!form.fieldName.trim() || !form.itemName.trim()}
        >
          {item ? "Update" : "Add"} Item
        </Button>
      </DialogActions>
    </Dialog>
  );
}
