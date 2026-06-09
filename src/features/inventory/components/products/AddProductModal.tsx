import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import { toast } from "sonner";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import {
  INVENTORY_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_UNITS,
  VENDORS,
} from "../../constants/inventoryConstants";
import { addProduct, updateProduct } from "../../lib/inventoryStore";
import type { InventoryProduct } from "../../types/inventory";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  editProduct?: InventoryProduct | null;
}

const EMPTY_FORM = {
  name: "",
  sku: "",
  category: "Turf" as const,
  unit: "sq ft" as const,
  unitCost: "",
  sellingPrice: "",
  inventoryType: "Stocked" as const,
  reorderLevel: "",
  preferredVendor: "",
  notes: "",
};

export function AddProductModal({ open, onClose, editProduct }: AddProductModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  React.useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name,
        sku: editProduct.sku,
        category: editProduct.category,
        unit: editProduct.unit,
        unitCost: String(editProduct.unitCost),
        sellingPrice: String(editProduct.sellingPrice),
        inventoryType: editProduct.inventoryType,
        reorderLevel: String(editProduct.reorderLevel),
        preferredVendor: editProduct.preferredVendor,
        notes: editProduct.notes ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editProduct, open]);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.sku) {
      toast.error("Product name and SKU are required");
      return;
    }

    const product: InventoryProduct = {
      id: editProduct?.id ?? `prod-${Date.now()}`,
      sku: form.sku,
      name: form.name,
      category: form.category,
      unit: form.unit,
      unitCost: Number(form.unitCost) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      inventoryType: form.inventoryType,
      reorderLevel: Number(form.reorderLevel) || 0,
      currentStock: editProduct?.currentStock ?? 0,
      preferredVendor: form.preferredVendor,
      status: editProduct?.status ?? "Active",
      notes: form.notes,
      createdAt: editProduct?.createdAt ?? new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    if (editProduct) {
      updateProduct(editProduct.id, product);
      toast.success("Product updated");
    } else {
      addProduct(product);
      toast.success("Product added");
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {editProduct ? "Edit Product" : "Add Product"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Product Name"
                value={form.name}
                onChange={(v) => update("name", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="SKU"
                value={form.sku}
                onChange={(v) => update("sku", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Category"
                value={form.category}
                onChange={(v) => update("category", v)}
                options={PRODUCT_CATEGORIES}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Unit"
                value={form.unit}
                onChange={(v) => update("unit", v)}
                options={PRODUCT_UNITS}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Inventory Type"
                value={form.inventoryType}
                onChange={(v) => update("inventoryType", v)}
                options={INVENTORY_TYPES}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Unit Cost ($)"
                type="number"
                value={form.unitCost}
                onChange={(v) => update("unitCost", v)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Selling Price ($)"
                type="number"
                value={form.sellingPrice}
                onChange={(v) => update("sellingPrice", v)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Reorder Level"
                type="number"
                value={form.reorderLevel}
                onChange={(v) => update("reorderLevel", v)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Preferred Vendor"
                value={form.preferredVendor}
                onChange={(v) => update("preferredVendor", v)}
                options={VENDORS}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Notes"
                value={form.notes}
                onChange={(v) => update("notes", v)}
                multiline
                minRows={2}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {editProduct ? "Save Changes" : "Add Product"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
