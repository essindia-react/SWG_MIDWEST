import type { Project, ProjectBudget } from "../types/project";

export function getEmptyProjectBudget(): ProjectBudget {
  return {
    materials: [],
    crew: [],
    equipment: [],
    overhead: [],
  };
}

export interface BudgetSummary {
  totalMaterialCost: number;
  totalLaborCost: number;
  totalEquipmentCost: number;
  totalOtherExpenses: number;
  totalEstimatedBudget: number;
  contractValue: number;
  estimatedGrossProfit: number;
  estimatedProfitMargin: number;
}

export function calculateBudgetSummary(project: Project): BudgetSummary {
  const budget = project.budget ?? getEmptyProjectBudget();

  const totalMaterialCost = budget.materials.reduce((sum, line) => sum + line.totalCost, 0);
  const totalLaborCost = budget.crew.reduce((sum, line) => sum + line.totalLaborCost, 0);
  const totalEquipmentCost = budget.equipment.reduce((sum, line) => sum + line.totalCost, 0);
  const totalOtherExpenses = budget.overhead.reduce(
    (sum, line) => sum + line.estimatedAmount,
    0
  );

  const totalEstimatedBudget =
    totalMaterialCost + totalLaborCost + totalEquipmentCost + totalOtherExpenses;
  const contractValue = project.projectValue ?? 0;
  const estimatedGrossProfit = contractValue - totalEstimatedBudget;
  const estimatedProfitMargin =
    contractValue > 0 ? (estimatedGrossProfit / contractValue) * 100 : 0;

  return {
    totalMaterialCost,
    totalLaborCost,
    totalEquipmentCost,
    totalOtherExpenses,
    totalEstimatedBudget,
    contractValue,
    estimatedGrossProfit,
    estimatedProfitMargin,
  };
}

export function formatBudgetCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBudgetPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
