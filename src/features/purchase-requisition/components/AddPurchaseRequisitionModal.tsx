import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  LabeledSelectField,
  SelectField,
  TextFieldInput,
} from "../../leads/components/workspace/workspaceFields";
import { DUMMY_PROJECTS } from "../../inventory/data/dummyInventoryData";
import { getMaterialRequests } from "../../inventory/lib/inventoryStore";
import { VENDORS } from "../../inventory/constants/inventoryConstants";
import {
  DELIVERY_ADDRESSES,
  PAYMENT_TERMS,
  PO_TYPES,
  VENDOR_DETAILS,
} from "../constants/purchaseRequisitionConstants";
import {
  addPurchaseRequisition,
  getPurchaseRequisitions,
} from "../lib/purchaseRequisitionStore";
import { formatCurrency, generatePONumber, todayISO } from "../lib/purchaseRequisitionHelpers";
import type {
  DeliveryAddress,
  PaymentTerms,
  POType,
  POLineItem,
  PurchaseRequisition,
} from "../types/purchaseRequisition";
import { AddPOLineItemModal } from "./AddPOLineItemModal";

interface AddPurchaseRequisitionModalProps {
  open: boolean;
  onClose: () => void;
}

const EMPTY_FORM = {
  poType: "Materials" as POType,
  linkedProjectId: "",
  linkedMaterialRequestNumber: "",
  vendorName: "",
  vendorContact: "",
  vendorEmail: "",
  deliveryAddress: "Job Site" as DeliveryAddress,
  requiredDeliveryDate: "",
  paymentTerms: "Net 30" as PaymentTerms,
  notesToVendor: "",
};

export function AddPurchaseRequisitionModal({ open, onClose }: AddPurchaseRequisitionModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [lineItems, setLineItems] = useState<POLineItem[]>([]);
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [previewPoNumber, setPreviewPoNumber] = useState("");

  const materialRequests = useMemo(() => getMaterialRequests(), [open]);
  const projectOptions = useMemo(
    () => DUMMY_PROJECTS.map((p) => ({ value: p.id, label: p.name })),
    []
  );
  const materialRequestOptions = useMemo(
    () =>
      materialRequests.map((mr) => ({
        value: mr.requestNo,
        label: `${mr.requestNo} — ${mr.projectName}`,
      })),
    [materialRequests]
  );

  useEffect(() => {
    if (open) {
      setForm(EMPTY_FORM);
      setLineItems([]);
      setPreviewPoNumber(generatePONumber(getPurchaseRequisitions()));
    }
  }, [open]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleVendorChange = (vendorName: string) => {
    const details = VENDOR_DETAILS[vendorName];
    setForm((prev) => ({
      ...prev,
      vendorName,
      vendorContact: details?.contact ?? "",
      vendorEmail: details?.email ?? "",
    }));
  };

  const handleMaterialRequestChange = (requestNo: string) => {
    const mr = materialRequests.find((r) => r.requestNo === requestNo);
    setForm((prev) => ({
      ...prev,
      linkedMaterialRequestNumber: requestNo,
      linkedProjectId: mr?.projectId ?? prev.linkedProjectId,
    }));
  };

  const handleAddLineItem = (item: POLineItem) => {
    setLineItems((prev) => [...prev, item]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const lineItemsTotal = lineItems.reduce((sum, item) => sum + item.total, 0);

  const handleSave = () => {
    if (!form.linkedProjectId) {
      toast.error("Linked project is required");
      return;
    }
    if (!form.vendorName) {
      toast.error("Vendor name is required");
      return;
    }
    if (!form.requiredDeliveryDate) {
      toast.error("Required delivery date is required");
      return;
    }
    if (lineItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    const project = DUMMY_PROJECTS.find((p) => p.id === form.linkedProjectId);

    const payload: Omit<PurchaseRequisition, "id" | "poNumber" | "poDate" | "createdAt"> = {
      poType: form.poType,
      linkedProjectId: form.linkedProjectId,
      linkedProjectName: project?.name ?? "",
      linkedMaterialRequestNumber: form.linkedMaterialRequestNumber,
      vendorName: form.vendorName,
      vendorContact: form.vendorContact,
      vendorEmail: form.vendorEmail,
      deliveryAddress: form.deliveryAddress,
      requiredDeliveryDate: form.requiredDeliveryDate,
      paymentTerms: form.paymentTerms,
      notesToVendor: form.notesToVendor,
      lineItems,
      status: "Draft",
    };

    addPurchaseRequisition(payload);
    toast.success("Purchase requisition created");
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Add Purchase Requisition</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="PO #"
                  value={previewPoNumber}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="PO Date"
                  type="date"
                  value={todayISO()}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="PO Type"
                  value={form.poType}
                  onChange={(v) => update("poType", v as POType)}
                  options={PO_TYPES}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <LabeledSelectField
                  label="Linked Project"
                  value={form.linkedProjectId}
                  onChange={(v) => update("linkedProjectId", v)}
                  options={projectOptions}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <LabeledSelectField
                  label="Linked Material Request #"
                  value={form.linkedMaterialRequestNumber}
                  onChange={handleMaterialRequestChange}
                  options={[{ value: "", label: "None" }, ...materialRequestOptions]}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2.5 }} />
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, mb: 1.5 }}>
              Vendor Details
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="Vendor Name"
                  value={form.vendorName}
                  onChange={handleVendorChange}
                  options={VENDORS}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="Vendor Contact"
                  value={form.vendorContact}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="Vendor Email"
                  value={form.vendorEmail}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="Delivery Address"
                  value={form.deliveryAddress}
                  onChange={(v) => update("deliveryAddress", v as DeliveryAddress)}
                  options={DELIVERY_ADDRESSES}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="Required Delivery Date"
                  type="date"
                  value={form.requiredDeliveryDate}
                  onChange={(v) => update("requiredDeliveryDate", v)}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="Payment Terms"
                  value={form.paymentTerms}
                  onChange={(v) => update("paymentTerms", v as PaymentTerms)}
                  options={PAYMENT_TERMS}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextFieldInput
                  label="Notes to Vendor"
                  value={form.notesToVendor}
                  onChange={(v) => update("notesToVendor", v)}
                  multiline
                  minRows={2}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>Line Items</Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Plus size={16} />}
                onClick={() => setShowLineItemModal(true)}
                disabled={!form.vendorName}
              >
                Add Item
              </Button>
            </Box>

            <TableContainer
              sx={{
                mt: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Item", "SKU", "Qty", "Unit", "Unit Price", "Total", ""].map((col) => (
                      <TableCell key={col || "actions"} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                        {col}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lineItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                        No line items yet — click Add Item to begin
                      </TableCell>
                    </TableRow>
                  ) : (
                    lineItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell sx={{ fontWeight: 500 }}>{item.itemName}</TableCell>
                        <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                          {item.sku}
                        </TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(item.total)}</TableCell>
                        <TableCell>
                          <IconButton size="small" onClick={() => handleRemoveLineItem(item.id)}>
                            <Trash2 size={14} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {lineItems.length > 0 && (
              <Box sx={{ mt: 1.5, textAlign: "right" }}>
                <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
                  PO Total: {formatCurrency(lineItemsTotal)}
                </Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Create PO
          </Button>
        </DialogActions>
      </Dialog>

      <AddPOLineItemModal
        open={showLineItemModal}
        onClose={() => setShowLineItemModal(false)}
        onSave={handleAddLineItem}
        vendorName={form.vendorName}
      />
    </>
  );
}
