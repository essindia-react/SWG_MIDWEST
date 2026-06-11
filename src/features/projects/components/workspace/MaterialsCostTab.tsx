import { useEffect, useMemo, useState } from "react";
import { subscribeInventory } from "../../../inventory/lib/inventoryStore";
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
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatBudgetCurrency } from "../../../../lib/budgetHelpers";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import {
  getInventoryCatalogItems,
  getInventoryItem,
  MATERIAL_SOURCES,
  MATERIAL_UNITS,
} from "../../constants/budgetConstants";
import type { MaterialCostLine, Project, ProjectBudget } from "../../../../types/project";
import { useBudgetLineRemover } from "./useBudgetLineRemover";

interface MaterialsCostTabProps {
  project: Project;
  onBudgetChange: (budget: ProjectBudget) => void;
}

export function MaterialsCostTab({ project, onBudgetChange }: MaterialsCostTabProps) {
  const budget = project.budget;
  const { removeLine, confirmDialog } = useBudgetLineRemover(budget, onBudgetChange);
  const [inventoryItems, setInventoryItems] = useState(getInventoryCatalogItems);

  useEffect(() => subscribeInventory(() => setInventoryItems(getInventoryCatalogItems())), []);

  const [form, setForm] = useState({
    materialName: "",
    sku: "",
    unit: "",
    estimatedQuantity: "",
    unitCost: "",
    source: "",
    notes: "",
  });

  const handleMaterialNameChange = (name: string) => {
    const item = getInventoryItem(name);
    setForm((prev) => ({
      ...prev,
      materialName: name,
      sku: item?.sku ?? "",
      unit: item?.unit ?? prev.unit,
      unitCost: item ? String(item.unitCost) : prev.unitCost,
    }));
  };

  const addMaterial = () => {
    const qty = Number(form.estimatedQuantity) || 0;
    const unitCost = Number(form.unitCost) || 0;
    if (!form.materialName || qty <= 0) {
      toast.error("Select material and enter quantity");
      return;
    }
    if (!getInventoryItem(form.materialName)) {
      toast.error("Materials must be selected from active inventory");
      return;
    }
    const line: MaterialCostLine = {
      id: `mat-${Date.now()}`,
      materialName: form.materialName,
      sku: form.sku,
      unit: form.unit || "sq ft",
      estimatedQuantity: qty,
      unitCost,
      totalCost: qty * unitCost,
      source: "From Inventory",
      notes: form.notes,
    };
    onBudgetChange({ ...budget, materials: [...budget.materials, line] });
    setForm({
      materialName: "",
      sku: "",
      unit: "",
      estimatedQuantity: "",
      unitCost: "",
      source: "",
      notes: "",
    });
    toast.success("Material line added");
  };

  const lineTotalCost =
    (Number(form.estimatedQuantity) || 0) * (Number(form.unitCost) || 0);
  const sectionTotal = useMemo(
    () => budget.materials.reduce((sum, line) => sum + line.totalCost, 0),
    [budget.materials]
  );

  return (
    <>
      <WorkspaceSection title="Materials Cost Planning">
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Material Name"
              value={form.materialName}
              onChange={handleMaterialNameChange}
              options={inventoryItems.map((i) => i.name)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput label="SKU" value={form.sku} onChange={() => {}} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <SelectField
              label="Unit"
              value={form.unit}
              onChange={(v) => setForm((p) => ({ ...p, unit: v }))}
              options={MATERIAL_UNITS}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Estimated Quantity"
              value={form.estimatedQuantity}
              onChange={(v) => setForm((p) => ({ ...p, estimatedQuantity: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Unit Cost ($)"
              value={form.unitCost}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Total Cost ($)"
              value={lineTotalCost > 0 ? formatBudgetCurrency(lineTotalCost) : ""}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Source"
              value={form.source}
              onChange={(v) => setForm((p) => ({ ...p, source: v }))}
              options={MATERIAL_SOURCES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <TextFieldInput
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addMaterial}>
              Add Material
            </Button>
          </Grid>
        </Grid>
        {budget.materials.length > 0 && (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Unit Cost</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Cost ($)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {budget.materials.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell>{line.materialName}</TableCell>
                    <TableCell>{line.sku}</TableCell>
                    <TableCell>
                      {line.estimatedQuantity} {line.unit}
                    </TableCell>
                    <TableCell>{formatBudgetCurrency(line.unitCost)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatBudgetCurrency(line.totalCost)}
                    </TableCell>
                    <TableCell>{line.source}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeLine("materials", line.id, line.materialName)}
                      >
                        <Trash2 size={14} color="#DC2626" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
        {budget.materials.length > 0 && (
          <Box
            sx={{
              mt: 2,
              px: 2.5,
              py: 1.5,
              borderRadius: 2,
              bgcolor: "rgba(46, 125, 50, 0.06)",
              border: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.875rem", fontWeight: 600 }}>
              Total Material Cost ($)
            </Typography>
            <Typography sx={{ fontSize: "1rem", fontWeight: 700, color: "primary.main" }}>
              {formatBudgetCurrency(sectionTotal)}
            </Typography>
          </Box>
        )}
      </WorkspaceSection>
      {confirmDialog}
    </>
  );
}
