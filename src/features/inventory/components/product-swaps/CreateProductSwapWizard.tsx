import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Step,
  StepLabel,
  Stepper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
} from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  LabeledSelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import {
  DUMMY_ALLOCATED_MATERIALS,
  DUMMY_PROJECTS,
} from "../../data/dummyInventoryData";
import { formatCurrency, generateSwapNumber } from "../../lib/inventoryHelpers";
import { addProductSwap, getProducts } from "../../lib/inventoryStore";
import type { ProductSwap } from "../../types/inventory";

interface CreateProductSwapWizardProps {
  open: boolean;
  onClose: () => void;
}

const STEPS = [
  "Project Selection",
  "Allocated Materials",
  "Replacement Material",
  "Inventory Validation",
  "Confirmation",
];

export function CreateProductSwapWizard({ open, onClose }: CreateProductSwapWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [projectId, setProjectId] = useState(DUMMY_PROJECTS[0]?.id ?? "");
  const [milestone, setMilestone] = useState("");
  const [task, setTask] = useState("");
  const [selectedMaterialIdx, setSelectedMaterialIdx] = useState<number | null>(null);
  const [newProductId, setNewProductId] = useState("");
  const [swapQuantity, setSwapQuantity] = useState("");
  const [reason, setReason] = useState("");

  const products = getProducts().filter((p) => p.inventoryType !== "Non-Inventory");
  const selectedMaterial =
    selectedMaterialIdx != null ? DUMMY_ALLOCATED_MATERIALS[selectedMaterialIdx] : null;
  const oldProduct = selectedMaterial
    ? products.find((p) => p.id === selectedMaterial.productId)
    : null;
  const newProduct = products.find((p) => p.id === newProductId);
  const qty = Number(swapQuantity) || 0;
  const availableStock = newProduct?.currentStock ?? 0;
  const stockShortage = Math.max(0, qty - availableStock);
  const costImpact =
    oldProduct && newProduct ? (newProduct.unitCost - oldProduct.unitCost) * qty : 0;

  const reset = () => {
    setActiveStep(0);
    setProjectId(DUMMY_PROJECTS[0]?.id ?? "");
    setMilestone("");
    setTask("");
    setSelectedMaterialIdx(null);
    setNewProductId("");
    setSwapQuantity("");
    setReason("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = () => {
    const project = DUMMY_PROJECTS.find((p) => p.id === projectId);
    if (!project || !selectedMaterial || !newProduct || !oldProduct) return;

    const swap: ProductSwap = {
      id: `swap-${Date.now()}`,
      swapNumber: generateSwapNumber(),
      date: new Date().toISOString().slice(0, 10),
      projectId: project.id,
      projectName: project.name,
      milestone: milestone || undefined,
      task: task || undefined,
      oldProductId: oldProduct.id,
      oldProductName: oldProduct.name,
      newProductId: newProduct.id,
      newProductName: newProduct.name,
      quantity: qty,
      unit: selectedMaterial.unit,
      status: "Pending",
      createdBy: "Maria S.",
      reason,
      quantityReturned: qty,
      quantityRequired: qty,
      availableStock,
      stockShortage,
      costImpact,
      approvalHistory: [
        { timestamp: new Date().toISOString(), action: "Submitted", user: "Maria S." },
      ],
    };

    addProductSwap(swap);
    toast.success("Product swap submitted for approval");
    handleClose();
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0:
        return !!projectId;
      case 1:
        return selectedMaterialIdx != null;
      case 2:
        return !!newProductId && qty > 0 && !!reason;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <LabeledSelectField
                label="Project"
                value={projectId}
                onChange={setProjectId}
                options={DUMMY_PROJECTS.map((p) => ({ value: p.id, label: p.name }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Milestone"
                value={milestone}
                onChange={setMilestone}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput label="Task (optional)" value={task} onChange={setTask} />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["Product", "Allocated Qty", "Used Qty", "Remaining Qty", "Select"].map(
                    (col) => (
                      <TableCell key={col} sx={{ fontWeight: 600 }}>
                        {col}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {DUMMY_ALLOCATED_MATERIALS.map((mat, idx) => (
                  <TableRow
                    key={mat.productId}
                    hover
                    selected={selectedMaterialIdx === idx}
                    onClick={() => setSelectedMaterialIdx(idx)}
                    sx={{ cursor: "pointer" }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>{mat.productName}</TableCell>
                    <TableCell>
                      {mat.allocatedQty} {mat.unit}
                    </TableCell>
                    <TableCell>
                      {mat.usedQty} {mat.unit}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {mat.remainingQty} {mat.unit}
                    </TableCell>
                    <TableCell>
                      <input
                        type="radio"
                        checked={selectedMaterialIdx === idx}
                        onChange={() => setSelectedMaterialIdx(idx)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 2:
        return (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput
                label="Old Product"
                value={selectedMaterial?.productName ?? ""}
                onChange={() => {}}
                disabled
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <LabeledSelectField
                label="New Product"
                value={newProductId}
                onChange={setNewProductId}
                options={products
                  .filter((p) => p.id !== selectedMaterial?.productId)
                  .map((p) => ({ value: p.id, label: p.name }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Swap Quantity"
                type="number"
                value={swapQuantity}
                onChange={setSwapQuantity}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextFieldInput label="Reason" value={reason} onChange={setReason} multiline minRows={2} />
            </Grid>
          </Grid>
        );

      case 3:
        return (
          <Box>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {[
                { label: "Quantity Returned", value: String(qty) },
                { label: "Quantity Required", value: String(qty) },
                { label: "Available Stock", value: String(availableStock) },
                {
                  label: "Stock Shortage",
                  value: String(stockShortage),
                  warn: stockShortage > 0,
                },
              ].map((item) => (
                <Grid key={item.label} size={{ xs: 6, sm: 3 }}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: 1,
                      borderColor: item.warn ? "warning.main" : "divider",
                      bgcolor: item.warn ? "rgba(249,168,37,0.08)" : "background.paper",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: item.warn ? "warning.dark" : "text.primary" }}>
                      {item.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            {stockShortage > 0 ? (
              <Alert severity="warning" icon={<AlertTriangle size={18} />}>
                Insufficient stock for replacement product. You can create a Purchase Request
                after confirming the swap.
                <Button size="small" sx={{ ml: 2 }} onClick={() => toast.info("PO request — demo mode")}>
                  Create Purchase Request
                </Button>
              </Alert>
            ) : (
              <Alert severity="success">Stock is sufficient — swap can proceed.</Alert>
            )}
          </Box>
        );

      case 4:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {[
              { label: "Old Product Returned", value: `${qty} ${selectedMaterial?.unit} — ${oldProduct?.name}` },
              { label: "New Product Allocated", value: `${qty} ${selectedMaterial?.unit} — ${newProduct?.name}` },
              { label: "Inventory Impact", value: stockShortage > 0 ? `Shortage of ${stockShortage} units` : "No shortage" },
              { label: "Project Cost Impact", value: formatCurrency(costImpact) },
            ].map((row) => (
              <Box
                key={row.label}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {row.label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {row.value}
                </Typography>
              </Box>
            ))}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Create Product Swap</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {renderStep()}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep((s) => s - 1)}>Back</Button>
        )}
        {activeStep < STEPS.length - 1 ? (
          <Button
            variant="contained"
            onClick={() => setActiveStep((s) => s + 1)}
            disabled={!canProceed()}
          >
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleConfirm} disabled={!canProceed()}>
            Confirm Swap
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
