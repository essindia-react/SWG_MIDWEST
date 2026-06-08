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
import {
  BUDGET_EMPLOYEES,
  getBudgetEmployee,
  WORK_TYPES,
} from "../../constants/budgetConstants";
import type { CrewCostLine, Project, ProjectBudget } from "../../../../types/project";
import { useBudgetLineRemover } from "./useBudgetLineRemover";

interface CrewCostTabProps {
  project: Project;
  onBudgetChange: (budget: ProjectBudget) => void;
}

export function CrewCostTab({ project, onBudgetChange }: CrewCostTabProps) {
  const budget = project.budget;
  const { removeLine, confirmDialog } = useBudgetLineRemover(budget, onBudgetChange);

  const [form, setForm] = useState({
    employeeName: "",
    role: "",
    estimatedHours: "",
    hourlyRate: "",
    workType: "Regular",
  });

  const handleEmployeeChange = (name: string) => {
    const emp = getBudgetEmployee(name);
    setForm((prev) => ({
      ...prev,
      employeeName: name,
      role: emp?.role ?? "",
      hourlyRate: emp ? String(emp.hourlyRate) : "",
    }));
  };

  const addCrew = () => {
    const hours = Number(form.estimatedHours) || 0;
    const rate = Number(form.hourlyRate) || 0;
    if (!form.employeeName || hours <= 0) {
      toast.error("Select employee and enter hours");
      return;
    }
    const line: CrewCostLine = {
      id: `crew-${Date.now()}`,
      employeeName: form.employeeName,
      role: form.role,
      estimatedHours: hours,
      hourlyRate: rate,
      totalLaborCost: hours * rate,
      workType: form.workType,
    };
    onBudgetChange({ ...budget, crew: [...budget.crew, line] });
    setForm({
      employeeName: "",
      role: "",
      estimatedHours: "",
      hourlyRate: "",
      workType: "Regular",
    });
    toast.success("Crew line added");
  };

  const lineTotalLaborCost =
    (Number(form.estimatedHours) || 0) * (Number(form.hourlyRate) || 0);
  const sectionTotal = useMemo(
    () => budget.crew.reduce((sum, line) => sum + line.totalLaborCost, 0),
    [budget.crew]
  );

  return (
    <>
      <WorkspaceSection title="Crew Cost Planning">
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Employee Name"
              value={form.employeeName}
              onChange={handleEmployeeChange}
              options={BUDGET_EMPLOYEES.map((e) => e.name)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput label="Role" value={form.role} onChange={() => {}} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Estimated Hours"
              value={form.estimatedHours}
              onChange={(v) => setForm((p) => ({ ...p, estimatedHours: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Hourly Rate ($)"
              value={form.hourlyRate}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <TextFieldInput
              label="Total Labor Cost ($)"
              value={lineTotalLaborCost > 0 ? formatBudgetCurrency(lineTotalLaborCost) : ""}
              onChange={() => {}}
              disabled
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2 }}>
            <SelectField
              label="Work Type"
              value={form.workType}
              onChange={(v) => setForm((p) => ({ ...p, workType: v }))}
              options={WORK_TYPES}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addCrew}>
              Add Crew Line
            </Button>
          </Grid>
        </Grid>
        {budget.crew.length > 0 && (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "auto" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Rate</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total Labor Cost ($)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Work Type</TableCell>
                  <TableCell sx={{ width: 48 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {budget.crew.map((line) => (
                  <TableRow key={line.id} hover>
                    <TableCell>{line.employeeName}</TableCell>
                    <TableCell>{line.role}</TableCell>
                    <TableCell>{line.estimatedHours}</TableCell>
                    <TableCell>{formatBudgetCurrency(line.hourlyRate)}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {formatBudgetCurrency(line.totalLaborCost)}
                    </TableCell>
                    <TableCell>{line.workType}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => removeLine("crew", line.id, line.employeeName)}
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
        {budget.crew.length > 0 && (
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
              Total Labor Cost ($)
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
