import React, { useState } from "react";
import { toast } from "sonner";
import { EmployeeList } from "../../features/hr/components/EmployeeList";
import { EmployeeForm } from "../../features/hr/components/EmployeeForm";
import { useHR } from "../../hooks/useHR";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog";
import { Employee } from "../../types/hr";

export function EmployeeRecordsPage() {
  const { employees, addEmployee, updateEmployee, deleteEmployee, getEmployeeById } = useHR();
  const { requestConfirm, confirmDialog } = useConfirmDialog();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setViewingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setViewingId(null);
    setFormOpen(true);
  };

  const handleView = (id: string) => {
    setViewingId(id);
    setEditingId(null);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const employee = getEmployeeById(id);
    if (!employee) return;

    requestConfirm({
      title: "Delete Employee?",
      description: `Are you sure you want to delete ${employee.firstName} ${employee.lastName}? This action cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        deleteEmployee(id);
        toast.success("Employee record deleted");
      },
    });
  };

  const handleSubmit = (data: any) => {
    if (editingId) {
      updateEmployee(editingId, data);
      toast.success("Employee record updated");
    } else {
      addEmployee(data);
      toast.success("New employee added");
    }
    setFormOpen(false);
  };

  const selectedEmployee = (editingId || viewingId) ? getEmployeeById((editingId || viewingId)!) : undefined;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <EmployeeList
        onAddEmployee={handleAdd}
        onEditEmployee={handleEdit}
        onViewEmployee={handleView}
        onDeleteEmployee={handleDelete}
      />

      <EmployeeForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedEmployee}
        title={viewingId ? "Employee Details" : editingId ? "Edit Employee" : "Add New Employee"}
      />

      {confirmDialog}
    </div>
  );
}
