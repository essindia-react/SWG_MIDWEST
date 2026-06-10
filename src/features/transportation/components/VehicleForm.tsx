import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { X } from "lucide-react";
import {
  TextFieldInput,
  SelectField,
  LabeledSelectField,
} from "../../leads/components/workspace/workspaceFields";
import { Vehicle, VehicleType, VehicleStatus } from "../../../types/transportation";
import { useHR } from "../../../hooks/useHR";
import { useProjects } from "../../../hooks/useProjects";

interface VehicleFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Vehicle;
  title: string;
}

const VEHICLE_TYPES: VehicleType[] = ["Truck", "Trailer", "Van", "Equipment Trailer"];
const VEHICLE_STATUSES: VehicleStatus[] = ["Available", "In Transit", "At Job Site", "In Maintenance"];

const EMPTY_FORM = {
  name: "",
  type: "Truck" as VehicleType,
  licensePlate: "",
  gpsDeviceId: "",
  status: "Available" as VehicleStatus,
  assignedDriverId: "none",
  assignedProjectId: "none",
  todayMileage: 0,
};

export function VehicleForm({ open, onClose, onSubmit, initialData, title }: VehicleFormProps) {
  const { employees } = useHR();
  const { projects } = useProjects();
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        type: initialData.type,
        licensePlate: initialData.licensePlate,
        gpsDeviceId: initialData.gpsDeviceId,
        status: initialData.status,
        assignedDriverId: initialData.assignedDriverId || "none",
        assignedProjectId: initialData.assignedProjectId || "none",
        todayMileage: initialData.todayMileage,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const dataToSubmit = {
      ...form,
      assignedDriverId: form.assignedDriverId === "none" ? undefined : form.assignedDriverId,
      assignedProjectId: form.assignedProjectId === "none" ? undefined : form.assignedProjectId,
    };
    onSubmit(dataToSubmit);
  };

  const driverOptions = [
    { value: "none", label: "Unassigned" },
    ...employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName} (${e.role})` }))
  ];

  const projectOptions = [
    { value: "none", label: "Unassigned" },
    ...projects.map(p => ({ value: p.id, label: `${p.projectCode} - ${p.customerName || 'Unknown'}` }))
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
        {title}
        <Button onClick={onClose} color="inherit" sx={{ minWidth: "auto", p: 0.5 }}>
          <X size={20} />
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
            Vehicle Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Vehicle Name"
                value={form.name}
                onChange={(v) => handleChange("name", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Type"
                value={form.type}
                onChange={(v) => handleChange("type", v)}
                options={VEHICLE_TYPES}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="License Plate"
                value={form.licensePlate}
                onChange={(v) => handleChange("licensePlate", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="GPS Device ID"
                value={form.gpsDeviceId}
                onChange={(v) => handleChange("gpsDeviceId", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Status"
                value={form.status}
                onChange={(v) => handleChange("status", v)}
                options={VEHICLE_STATUSES}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
            Assignments
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledSelectField
                label="Assigned Driver"
                value={form.assignedDriverId}
                onChange={(v) => handleChange("assignedDriverId", v)}
                options={driverOptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <LabeledSelectField
                label="Assigned Project"
                value={form.assignedProjectId}
                onChange={(v) => handleChange("assignedProjectId", v)}
                options={projectOptions}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? "Save Changes" : "Add Vehicle"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
