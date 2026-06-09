import React, { useEffect, useMemo, useState } from "react";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  LabeledSelectField,
  SelectField,
  TextFieldInput,
} from "../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../leads/components/workspace/WorkspaceSection";
import { DUMMY_PROJECTS } from "../../inventory/data/dummyInventoryData";
import { VENDORS } from "../../inventory/constants/inventoryConstants";
import { getMaterialRequests } from "../../inventory/lib/inventoryStore";
import { InventorySlideDrawer } from "../../inventory/components/shared/InventorySlideDrawer";
import { InventoryStatusChip } from "../../inventory/components/shared/InventoryStatusChip";
import {
  DELIVERY_ADDRESSES,
  PAYMENT_TERMS,
  PO_STATUSES,
  PO_STATUS_COLORS,
  PO_TYPES,
  VENDOR_DETAILS,
} from "../constants/purchaseRequisitionConstants";
import { updatePurchaseRequisition } from "../lib/purchaseRequisitionStore";
import { formatCurrency, formatDate } from "../lib/purchaseRequisitionHelpers";
import type {
  DeliveryAddress,
  PaymentTerms,
  POStatus,
  POType,
  POLineItem,
  PurchaseRequisition,
} from "../types/purchaseRequisition";
import { AddPOLineItemModal } from "./AddPOLineItemModal";

interface PurchaseRequisitionDetailsDrawerProps {
  requisition: PurchaseRequisition;
  mode: "view" | "edit";
  onClose: () => void;
  onModeChange: (mode: "view" | "edit") => void;
  onSaved: (updated: PurchaseRequisition) => void;
}

interface EditForm {
  poType: POType;
  linkedProjectId: string;
  linkedMaterialRequestNumber: string;
  vendorName: string;
  vendorContact: string;
  vendorEmail: string;
  deliveryAddress: DeliveryAddress;
  requiredDeliveryDate: string;
  paymentTerms: PaymentTerms;
  notesToVendor: string;
  status: POStatus;
  lineItems: POLineItem[];
}

function formFromRequisition(pr: PurchaseRequisition): EditForm {
  return {
    poType: pr.poType,
    linkedProjectId: pr.linkedProjectId,
    linkedMaterialRequestNumber: pr.linkedMaterialRequestNumber,
    vendorName: pr.vendorName,
    vendorContact: pr.vendorContact,
    vendorEmail: pr.vendorEmail,
    deliveryAddress: pr.deliveryAddress,
    requiredDeliveryDate: pr.requiredDeliveryDate,
    paymentTerms: pr.paymentTerms,
    notesToVendor: pr.notesToVendor,
    status: pr.status,
    lineItems: [...pr.lineItems],
  };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Grid>
  );
}

export function PurchaseRequisitionDetailsDrawer({
  requisition,
  mode,
  onClose,
  onModeChange,
  onSaved,
}: PurchaseRequisitionDetailsDrawerProps) {
  const isEditing = mode === "edit";
  const [form, setForm] = useState<EditForm>(() => formFromRequisition(requisition));
  const [showLineItemModal, setShowLineItemModal] = useState(false);
  const [editingLineItem, setEditingLineItem] = useState<POLineItem | null>(null);
  const [lineItemModalIntent, setLineItemModalIntent] = useState<"add" | POLineItem | null>(
    null
  );

  const materialRequests = useMemo(() => getMaterialRequests(), []);
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
    setForm(formFromRequisition(requisition));
  }, [requisition]);

  useEffect(() => {
    if (!isEditing || !lineItemModalIntent) return;
    if (lineItemModalIntent === "add") {
      setEditingLineItem(null);
      setShowLineItemModal(true);
    } else {
      setEditingLineItem(lineItemModalIntent);
      setShowLineItemModal(true);
    }
    setLineItemModalIntent(null);
  }, [isEditing, lineItemModalIntent]);

  const statusColors = PO_STATUS_COLORS[isEditing ? form.status : requisition.status];
  const displayLineItems = isEditing ? form.lineItems : requisition.lineItems;
  const lineItemsTotal = displayLineItems.reduce((sum, item) => sum + item.total, 0);

  const update = <K extends keyof EditForm>(key: K, value: EditForm[K]) => {
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

  const handleSaveLineItem = (item: POLineItem) => {
    setForm((prev) => {
      const exists = prev.lineItems.some((li) => li.id === item.id);
      return {
        ...prev,
        lineItems: exists
          ? prev.lineItems.map((li) => (li.id === item.id ? item : li))
          : [...prev.lineItems, item],
      };
    });
    setEditingLineItem(null);
  };

  const handleRemoveLineItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((li) => li.id !== id),
    }));
  };

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
    if (form.lineItems.length === 0) {
      toast.error("Add at least one line item");
      return;
    }

    const project = DUMMY_PROJECTS.find((p) => p.id === form.linkedProjectId);
    const updated = updatePurchaseRequisition(requisition.id, {
      poType: form.poType,
      linkedProjectId: form.linkedProjectId,
      linkedProjectName: project?.name ?? requisition.linkedProjectName,
      linkedMaterialRequestNumber: form.linkedMaterialRequestNumber,
      vendorName: form.vendorName,
      vendorContact: form.vendorContact,
      vendorEmail: form.vendorEmail,
      deliveryAddress: form.deliveryAddress,
      requiredDeliveryDate: form.requiredDeliveryDate,
      paymentTerms: form.paymentTerms,
      notesToVendor: form.notesToVendor,
      status: form.status,
      lineItems: form.lineItems,
    });

    if (updated) {
      toast.success("Purchase requisition updated");
      onSaved(updated);
      onModeChange("view");
    }
  };

  const openAddLineItem = () => {
    if (isEditing) {
      setEditingLineItem(null);
      setShowLineItemModal(true);
      return;
    }
    setLineItemModalIntent("add");
    onModeChange("edit");
  };

  const openEditLineItem = (item: POLineItem) => {
    if (isEditing) {
      setEditingLineItem(item);
      setShowLineItemModal(true);
      return;
    }
    setLineItemModalIntent(item);
    onModeChange("edit");
  };

  return (
    <>
      <InventorySlideDrawer
        title={requisition.poNumber}
        subtitle={`${isEditing ? form.poType : requisition.poType} · ${
          isEditing
            ? (DUMMY_PROJECTS.find((p) => p.id === form.linkedProjectId)?.name ??
              requisition.linkedProjectName)
            : requisition.linkedProjectName
        }`}
        onClose={onClose}
        width={620}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
          <InventoryStatusChip
            label={isEditing ? form.status : requisition.status}
            bg={statusColors.bg}
            color={statusColors.color}
          />
          {!isEditing && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Pencil size={14} />}
              onClick={() => onModeChange("edit")}
            >
              Edit
            </Button>
          )}
        </Box>

        <WorkspaceSection title="PO Information">
          {isEditing ? (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="PO #"
                  value={requisition.poNumber}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextFieldInput
                  label="PO Date"
                  type="date"
                  value={requisition.poDate}
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
                <SelectField
                  label="Status"
                  value={form.status}
                  onChange={(v) => update("status", v as POStatus)}
                  options={PO_STATUSES}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <LabeledSelectField
                  label="Linked Material Request #"
                  value={form.linkedMaterialRequestNumber}
                  onChange={handleMaterialRequestChange}
                  options={[{ value: "", label: "None" }, ...materialRequestOptions]}
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="Delivery Address"
                  value={form.deliveryAddress}
                  onChange={(v) => update("deliveryAddress", v as DeliveryAddress)}
                  options={DELIVERY_ADDRESSES}
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
          ) : (
            <Grid container spacing={2}>
              <DetailRow label="PO #" value={requisition.poNumber} />
              <DetailRow label="PO Date" value={formatDate(requisition.poDate)} />
              <DetailRow label="PO Type" value={requisition.poType} />
              <DetailRow label="Status" value={requisition.status} />
              <DetailRow label="Linked Project" value={requisition.linkedProjectName} />
              <DetailRow
                label="Linked Material Request #"
                value={requisition.linkedMaterialRequestNumber || "—"}
              />
              <DetailRow
                label="Required Delivery Date"
                value={formatDate(requisition.requiredDeliveryDate)}
              />
              <DetailRow label="Payment Terms" value={requisition.paymentTerms} />
              <DetailRow label="Delivery Address" value={requisition.deliveryAddress} />
              {requisition.notesToVendor && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Notes to Vendor
                  </Typography>
                  <Typography variant="body2">{requisition.notesToVendor}</Typography>
                </Grid>
              )}
            </Grid>
          )}
        </WorkspaceSection>

        <WorkspaceSection title="Vendor Details">
          {isEditing ? (
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
              <Grid size={{ xs: 12 }}>
                <TextFieldInput
                  label="Vendor Email"
                  value={form.vendorEmail}
                  onChange={() => {}}
                  disabled
                />
              </Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              <DetailRow label="Vendor Name" value={requisition.vendorName} />
              <DetailRow label="Vendor Contact" value={requisition.vendorContact} />
              <DetailRow label="Vendor Email" value={requisition.vendorEmail} />
            </Grid>
          )}
        </WorkspaceSection>

        <WorkspaceSection title="Line Items">
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Plus size={14} />}
              onClick={openAddLineItem}
            >
              Add Item
            </Button>
          </Box>

          {displayLineItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No line items on this purchase requisition.
            </Typography>
          ) : (
            <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    {["Item", "SKU", "Description", "Qty", "Unit", "Unit Price", "Total", ""].map(
                      (col) => (
                        <TableCell key={col || "actions"} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                          {col}
                        </TableCell>
                      )
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayLineItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell sx={{ fontWeight: 500, maxWidth: 120 }}>{item.itemName}</TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                        {item.sku}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8125rem", maxWidth: 120 }}>
                        {item.description || "—"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{item.unit}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.25 }}>
                          <IconButton
                            size="small"
                            aria-label="Edit line item"
                            onClick={() => openEditLineItem(item)}
                          >
                            <Pencil size={14} />
                          </IconButton>
                          {isEditing && (
                            <IconButton
                              size="small"
                              aria-label="Remove line item"
                              onClick={() => handleRemoveLineItem(item.id)}
                            >
                              <Trash2 size={14} />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={6} align="right" sx={{ fontWeight: 700 }}>
                      PO Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{formatCurrency(lineItemsTotal)}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          )}
        </WorkspaceSection>

        {isEditing && (
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              justifyContent: "flex-end",
              mt: 3,
              pt: 2,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Button
              color="inherit"
              onClick={() => {
                setForm(formFromRequisition(requisition));
                onModeChange("view");
              }}
            >
              Cancel
            </Button>
            <Button variant="contained" onClick={handleSave}>
              Save Changes
            </Button>
          </Box>
        )}
      </InventorySlideDrawer>

      <AddPOLineItemModal
        open={showLineItemModal}
        onClose={() => {
          setShowLineItemModal(false);
          setEditingLineItem(null);
        }}
        onSave={handleSaveLineItem}
        vendorName={isEditing ? form.vendorName : requisition.vendorName}
        editItem={editingLineItem}
      />
    </>
  );
}
