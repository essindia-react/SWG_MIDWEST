import { toast } from "sonner";
import { useConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import type { ProjectBudget } from "../../../../types/project";

export function useBudgetLineRemover(
  budget: ProjectBudget,
  onBudgetChange: (budget: ProjectBudget) => void
) {
  const { requestConfirm, confirmDialog } = useConfirmDialog();

  const removeLine = (section: keyof ProjectBudget, id: string, label: string) => {
    requestConfirm({
      title: "Remove Line?",
      description: `Remove "${label}" from the budget? This cannot be undone.`,
      confirmLabel: "Remove",
      onConfirm: () => {
        onBudgetChange({
          ...budget,
          [section]: budget[section].filter((line) => line.id !== id),
        });
        toast.success("Line removed");
      },
    });
  };

  return { removeLine, confirmDialog };
}
