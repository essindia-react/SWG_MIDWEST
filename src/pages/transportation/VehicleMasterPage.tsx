import React, { useState } from "react";
import { toast } from "sonner";
import { VehicleList } from "../../features/transportation/components/VehicleList";
import { VehicleForm } from "../../features/transportation/components/VehicleForm";
import { useTransportation } from "../../hooks/useTransportation";
import { useConfirmDialog } from "../../components/ui/ConfirmDialog";

export function VehicleMasterPage() {
  const { addVehicle, updateVehicle, deleteVehicle, getVehicleById } = useTransportation();
  const { requestConfirm, confirmDialog } = useConfirmDialog();
  
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

  const handleDelete = (id: string) => {
    const vehicle = getVehicleById(id);
    if (!vehicle) return;

    requestConfirm({
      title: "Delete Vehicle?",
      description: `Are you sure you want to delete ${vehicle.name} (${vehicle.licensePlate})? This action cannot be undone.`,
      confirmLabel: "Delete",
      onConfirm: () => {
        deleteVehicle(id);
        toast.success("Vehicle deleted successfully");
      },
    });
  };

  const handleSubmit = (data: any) => {
    if (editingId) {
      updateVehicle(editingId, data);
      toast.success("Vehicle updated successfully");
    } else {
      addVehicle(data);
      toast.success("New vehicle added");
    }
    setFormOpen(false);
  };

  const selectedVehicle = editingId ? getVehicleById(editingId) : undefined;

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <VehicleList
        onAddVehicle={handleAdd}
        onEditVehicle={handleEdit}
        onDeleteVehicle={handleDelete}
      />

      <VehicleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedVehicle}
        title={editingId ? "Edit Vehicle" : "Add New Vehicle"}
      />

      {confirmDialog}
    </div>
  );
}
