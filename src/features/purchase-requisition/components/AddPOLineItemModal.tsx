import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
} from "@mui/material";
import {
  LabeledSelectField,
  SelectField,
  TextFieldInput,
} from "../../leads/components/workspace/workspaceFields";
import { getProducts } from "../../inventory/lib/inventoryStore";
import type { InventoryProduct } from "../../inventory/types/inventory";
import { PO_LINE_ITEM_UNITS } from "../constants/purchaseRequisitionConstants";
import type { POLineItem, POLineItemUnit } from "../types/purchaseRequisition";

export interface POLineItemDraft {
  productId: string;
  itemName: string;
  sku: string;
  description: string;
  quantity: string;
  unit: POLineItemUnit;
  unitPrice: string;
}

interface AddPOLineItemModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (item: POLineItem) => void;
  vendorName: string;
  editItem?: POLineItem | null;
}

const EMPTY_DRAFT: POLineItemDraft = {
  productId: "",
  itemName: "",
  sku: "",
  description: "",
  quantity: "",
  unit: "sq ft",
  unitPrice: "",
};

function draftFromItem(item: POLineItem): POLineItemDraft {
  return {
    productId: item.productId,
    itemName: item.itemName,
    sku: item.sku,
    description: item.description,
    quantity: String(item.quantity),
    unit: item.unit,
    unitPrice: String(item.unitPrice),
  };
}

export function AddPOLineItemModal({
  open,
  onClose,
  onSave,
  vendorName,
  editItem,
}: AddPOLineItemModalProps) {
  const [draft, setDraft] = useState<POLineItemDraft>(EMPTY_DRAFT);
  const products = useMemo(() => getProducts().filter((p) => p.status === "Active"), []);
  const isEditing = Boolean(editItem);

  const productOptions = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name })),
    [products]
  );

  useEffect(() => {
    if (!open) return;
    setDraft(editItem ? draftFromItem(editItem) : EMPTY_DRAFT);
  }, [open, editItem]);

  const quantity = Number(draft.quantity) || 0;
  const unitPrice = Number(draft.unitPrice) || 0;
  const total = quantity * unitPrice;

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      setDraft((prev) => ({ ...prev, productId, itemName: "", sku: "", unitPrice: "" }));
      return;
    }
    setDraft((prev) => ({
      ...prev,
      productId,
      itemName: product.name,
      sku: product.sku,
      description: prev.description || product.notes || "",
      unit: normalizeUnit(product.unit),
      unitPrice: String(product.unitCost),
    }));
  };

  const handleSave = () => {
    if (!draft.productId || !draft.quantity || quantity <= 0) return;

    onSave({
      id: editItem?.id ?? `li-${Date.now()}`,
      productId: draft.productId,
      itemName: draft.itemName,
      sku: draft.sku,
      description: draft.description,
      quantity,
      unit: draft.unit,
      unitPrice,
      total,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>
        {isEditing ? "Edit Line Item" : "Add Line Item"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <LabeledSelectField
                label="Item Name"
                value={draft.productId}
                onChange={handleProductSelect}
                options={productOptions}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput label="SKU" value={draft.sku} onChange={() => {}} disabled />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Unit"
                value={draft.unit}
                onChange={(v) => setDraft((prev) => ({ ...prev, unit: v as POLineItemUnit }))}
                options={PO_LINE_ITEM_UNITS}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Description"
                value={draft.description}
                onChange={(v) => setDraft((prev) => ({ ...prev, description: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Quantity"
                type="number"
                value={draft.quantity}
                onChange={(v) => setDraft((prev) => ({ ...prev, quantity: v }))}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Unit Price ($)"
                type="number"
                value={draft.unitPrice}
                onChange={(v) => setDraft((prev) => ({ ...prev, unitPrice: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Total ($)"
                value={total > 0 ? total.toFixed(2) : ""}
                onChange={() => {}}
                disabled
              />
            </Grid>
          </Grid>
          {vendorName && (
            <Box sx={{ mt: 2, fontSize: "0.75rem", color: "text.secondary" }}>
              Pricing from {vendorName} — unit price is editable before saving.
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!draft.productId || quantity <= 0}
        >
          {isEditing ? "Save Item" : "Add Item"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function normalizeUnit(unit: InventoryProduct["unit"]): POLineItemUnit {
  if (unit === "sq ft" || unit === "roll" || unit === "bag" || unit === "unit") {
    return unit;
  }
  return "unit";
}
