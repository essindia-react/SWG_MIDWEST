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
import { OVERHEAD_CATEGORIES } from "../../constants/budgetConstants";
import type { OverheadExpenseLine, Project, ProjectBudget } from "../../../../types/project";
import { useBudgetLineRemover } from "./useBudgetLineRemover";

interface OverheadExpensesTabProps {
  project: Project;
  onBudgetChange: (budget: ProjectBudget) => void;
}

export function OverheadExpensesTab({ project, onBudgetChange }: OverheadExpensesTabProps) {
  const budget = project.budget;
  const { removeLine, confirmDialog } = useBudgetLineRemover(budget, onBudgetChange);

  const [form, setForm] = useState({
    expenseDescription: "",
    category: "",
    estimatedAmount: "",
  });

  const addOverhead = () => {
    const amount = Number(form.estimatedAmount) || 0;
    if (!form.expenseDescription || amount <= 0) {
      toast.error("Enter description and amount");
      return;
    }
    const line: OverheadExpenseLine = {
      id: `oh-${Date.now()}`,
      expenseDescription: form.expenseDescription,
      category: form.category || "Miscellaneous",
      estimatedAmount: amount,
    };
    onBudgetChange({ ...budget, overhead: [...budget.overhead, line] });
    setForm({ expenseDescription: "", category: "", estimatedAmount: "" });
    toast.success("Overhead expense added");
  };

  const sectionTotal = useMemo(
    () => budget.overhead.reduce((sum, line) => sum + line.estimatedAmount, 0),
    [budget.overhead]
  );

  return (
    <>
      <WorkspaceSection title="Overhead Expenses">
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput
              label="Expense Description"
              value={form.expenseDescription}
              onChange={(v) => setForm((p) => ({ ...p, expenseDescription: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Category"
              value={form.category}
              onChange={(v) => setForm((p) => ({ ...p, category: v }))}
              options={OVERHEAD_CATEGORIES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Estimated Amount ($)"
              value={form.estimatedAmount}
              onChange={(v) => setForm((p) => ({ ...p, estimatedAmount: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addOverhead}>
              Add Expense
            </Button>
          </Grid>
        </Grid>
        {budget.overhead.length > 0 && (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estimated Amount ($)</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {budget.overhead.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell>{line.expenseDescription}</TableCell>
                    <TableCell>{line.category}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatBudgetCurrency(line.estimatedAmount)}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() =>
                          removeLine("overhead", line.id, line.expenseDescription)
                        }
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
        {budget.overhead.length > 0 && (
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
              Total Other Expenses ($)
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
