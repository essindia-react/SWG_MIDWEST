import { useMemo, useState } from "react";
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
import { EQUIPMENT_ITEMS, getEquipmentItem } from "../../constants/budgetConstants";
import type { EquipmentCostLine, Project, ProjectBudget } from "../../../../types/project";
import { useBudgetLineRemover } from "./useBudgetLineRemover";

interface EquipmentCostTabProps {
  project: Project;
  onBudgetChange: (budget: ProjectBudget) => void;
}

export function EquipmentCostTab({ project, onBudgetChange }: EquipmentCostTabProps) {
  const budget = project.budget;
  const { removeLine, confirmDialog } = useBudgetLineRemover(budget, onBudgetChange);

  const [form, setForm] = useState({
    equipmentName: "",
    usageDays: "",
    dailyRate: "",
    notes: "",
  });

  const handleEquipmentChange = (name: string) => {
    const item = getEquipmentItem(name);
    setForm((prev) => ({
      ...prev,
      equipmentName: name,
      dailyRate: item ? String(item.dailyRate) : "",
    }));
  };

  const addEquipment = () => {
    const days = Number(form.usageDays) || 0;
    const rate = Number(form.dailyRate) || 0;
    if (!form.equipmentName || days <= 0) {
      toast.error("Select equipment and enter usage days");
      return;
    }
    const line: EquipmentCostLine = {
      id: `equip-${Date.now()}`,
      equipmentName: form.equipmentName,
      usageDays: days,
      dailyRate: rate,
      totalCost: days * rate,
      notes: form.notes,
    };
    onBudgetChange({ ...budget, equipment: [...budget.equipment, line] });
    setForm({ equipmentName: "", usageDays: "", dailyRate: "", notes: "" });
    toast.success("Equipment line added");
  };

  const lineTotalCost = (Number(form.usageDays) || 0) * (Number(form.dailyRate) || 0);
  const sectionTotal = useMemo(
    () => budget.equipment.reduce((sum, line) => sum + line.totalCost, 0),
    [budget.equipment]
  );

  return (
    <>
      <WorkspaceSection title="Equipment Cost Planning">
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <SelectField
              label="Equipment Name"
              value={form.equipmentName}
              onChange={handleEquipmentChange}
              options={EQUIPMENT_ITEMS.map((e) => e.name)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Usage Days"
              value={form.usageDays}
              onChange={(v) => setForm((p) => ({ ...p, usageDays: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Daily Rate ($)"
              value={form.dailyRate}
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
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Notes"
              value={form.notes}
              onChange={(v) => setForm((p) => ({ ...p, notes: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addEquipment}>
              Add Equipment
            </Button>
          </Grid>
        </Grid>
        {budget.equipment.length > 0 && (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Equipment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Days</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Daily Rate</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Cost ($)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {budget.equipment.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell>{line.equipmentName}</TableCell>
                    <TableCell>{line.usageDays}</TableCell>
                    <TableCell>{formatBudgetCurrency(line.dailyRate)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatBudgetCurrency(line.totalCost)}
                    </TableCell>
                    <TableCell>{line.notes || "—"}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeLine("equipment", line.id, line.equipmentName)}
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
        {budget.equipment.length > 0 && (
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
              Total Equipment Cost ($)
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
