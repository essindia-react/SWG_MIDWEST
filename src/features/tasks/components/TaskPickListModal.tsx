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
import { TASK_PICK_LIST_UNITS } from "../constants/taskManagementConstants";
import type { AssignedPickItem } from "../lib/taskPickListHelpers";
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
  category: "Material",
  sourceLineId: "",
  pulledFromInventory: false,
  notes: "",
};

interface TaskPickListModalProps {
  open: boolean;
  item?: TaskManagementPickListItem | null;
  availableItems: AssignedPickItem[];
  defaultFieldName?: string;
  onClose: () => void;
  onSave: (data: TaskManagementPickListFormData) => void;
}

export function TaskPickListModal({
  open,
  item,
  availableItems,
  defaultFieldName = "",
  onClose,
  onSave,
}: TaskPickListModalProps) {
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
          category: item.category,
          sourceLineId: item.sourceLineId,
          pulledFromInventory: item.pulledFromInventory,
          notes: item.notes,
        });
      } else {
        setForm({
          ...emptyForm,
          fieldName: defaultFieldName,
          unit: availableItems[0]?.unit ?? "sq ft",
        });
      }
    }
  }, [open, item, defaultFieldName, availableItems]);

  const handleItemChange = (itemName: string) => {
    const assigned = availableItems.find((entry) => entry.itemName === itemName);
    if (!assigned) return;
    setForm((prev) => ({
      ...prev,
      itemName: assigned.itemName,
      sku: assigned.sku,
      unit: assigned.unit,
      category: assigned.category,
      sourceLineId: assigned.sourceLineId,
    }));
  };

  const handleSubmit = () => {
    if (!form.fieldName.trim() || !form.itemName.trim() || !form.sourceLineId) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>
        {item ? "Edit Pick List Item" : "Add Pick List Item"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Area / Field Name"
            value={form.fieldName}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, fieldName: e.target.value }))
            }
            placeholder="e.g. Site Preparation"
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
            helperText={
              availableItems.length === 0
                ? "No materials or equipment assigned to this milestone"
                : "Only items from the project budget for this milestone"
            }
            disabled={availableItems.length === 0}
          >
            <MenuItem value="">Select assigned item...</MenuItem>
            {availableItems.map((assigned) => (
              <MenuItem key={assigned.sourceLineId} value={assigned.itemName}>
                {assigned.category === "Equipment" ? "🛠 " : "📦 "}
                {assigned.itemName} (budget: {assigned.quantityAvailable} {assigned.unit})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="SKU"
            value={form.sku}
            InputProps={{ readOnly: true }}
            fullWidth
            size="small"
            helperText="From project budget assignment"
          />

          <TextField
            label="Quantity Required"
            type="number"
            value={form.quantityRequired}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, quantityRequired: e.target.value }))
            }
            fullWidth
            size="small"
            inputProps={{ min: 0, step: "any" }}
            helperText="Quantity to pull for this task"
          />

          <TextField
            select
            label="Unit"
            value={form.unit}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, unit: e.target.value }))
            }
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
                  setForm((prev) => ({
                    ...prev,
                    pulledFromInventory: e.target.checked,
                  }))
                }
                color="primary"
                disabled={form.category === "Equipment"}
              />
            }
            label="Pulled from Inventory"
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: -1.5, ml: 1 }}
          >
            {form.category === "Equipment"
              ? "Equipment rentals are tracked separately from inventory stock"
              : "Updates inventory on confirmation when saved"}
          </Typography>

          <TextField
            label="Notes"
            value={form.notes}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, notes: e.target.value }))
            }
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
          disabled={
            !form.fieldName.trim() ||
            !form.itemName.trim() ||
            !form.sourceLineId ||
            availableItems.length === 0
          }
        >
          {item ? "Update" : "Add"} Item
        </Button>
      </DialogActions>
    </Dialog>
  );
}
