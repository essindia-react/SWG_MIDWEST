import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { Camera, Send } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "../../../components/layout/Sidebar";
import { getProjectAssignedMaterials } from "../lib/taskPickListHelpers";
import {
  MATERIAL_REQUEST_REASONS,
  MATERIAL_REQUEST_UNITS,
  MATERIAL_REQUEST_URGENCIES,
} from "../../site-material-request/constants/materialRequestConstants";
import { createMaterialRequest } from "../../site-material-request/lib/materialRequestStore";
import type { MaterialRequestFormData } from "../../site-material-request/types/materialRequest";
import type { Project, ProjectTask } from "../../../types/project";

const initialForm: MaterialRequestFormData = {
  itemName: "",
  quantityNeeded: "",
  unit: "sq ft",
  reason: "",
  urgency: "",
  notes: "",
  photoAttached: false,
};

interface TaskMaterialRequestModalProps {
  open: boolean;
  project: Project;
  task: ProjectTask;
  milestoneName: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function TaskMaterialRequestModal({
  open,
  project,
  task,
  milestoneName,
  onClose,
  onSubmitted,
}: TaskMaterialRequestModalProps) {
  const isMobile = useIsMobile();
  const [form, setForm] = useState<MaterialRequestFormData>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [requestNumber, setRequestNumber] = useState("");
  const assignedMaterials = getProjectAssignedMaterials(project);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setSubmitted(false);
      setRequestNumber("");
    }
  }, [open, task.id]);

  const updateForm = <K extends keyof MaterialRequestFormData>(
    key: K,
    value: MaterialRequestFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemChange = (itemName: string) => {
    const assigned = assignedMaterials.find((item) => item.itemName === itemName);
    updateForm("itemName", itemName);
    if (assigned) {
      updateForm("unit", assigned.unit);
    }
  };

  const handleSubmit = () => {
    const qty = Number(form.quantityNeeded);
    if (!form.itemName || !qty || qty <= 0 || !form.reason || !form.urgency) {
      toast.error("Please fill in all required fields");
      return;
    }

    const request = createMaterialRequest(
      {
        itemName: form.itemName,
        quantityNeeded: qty,
        unit: form.unit,
        reason: form.reason,
        urgency: form.urgency,
        photoAttached: form.photoAttached,
        notes: form.notes,
      },
      {
        projectCode: project.projectCode,
        projectName: `${project.customerName} — ${project.projectType}`,
        requestedBy: task.assignedTo || "Field Crew",
        taskId: task.id,
        taskName: task.name,
      }
    );

    setRequestNumber(request.requestNumber);
    setSubmitted(true);
    toast.success("Material request submitted — office notified");
    onSubmitted?.();
  };

  const requestDateTime = new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        {submitted ? "Request Submitted" : "Material Request"}
      </DialogTitle>
      <DialogContent>
        {submitted ? (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, color: "primary.main", mb: 1 }}>
              {requestNumber}
            </Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
              Your material request has been sent to the office. You&apos;ll receive a notification
              when it&apos;s reviewed.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              label="Project"
              value={`${project.projectCode} — ${project.customerName}`}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Task"
              value={`${task.name} (${milestoneName})`}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Requested By"
              value={task.assignedTo || "Field Crew"}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Request Date & Time"
              value={requestDateTime}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />

            <TextField
              select
              label="Item Name"
              value={form.itemName}
              onChange={(e) => handleItemChange(e.target.value)}
              fullWidth
              size="small"
              helperText="Only materials from the project budget (inventory catalog)"
            >
              <MenuItem value="">Select material...</MenuItem>
              {assignedMaterials.map((item) => (
                <MenuItem key={item.sourceLineId} value={item.itemName}>
                  {item.itemName} (budget: {item.quantityAvailable} {item.unit})
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              <TextField
                label="Quantity Needed"
                type="number"
                value={form.quantityNeeded}
                onChange={(e) => updateForm("quantityNeeded", e.target.value)}
                size="small"
                inputProps={{ min: 0 }}
              />
              <TextField
                select
                label="Unit"
                value={form.unit}
                onChange={(e) => updateForm("unit", e.target.value)}
                size="small"
              >
                {MATERIAL_REQUEST_UNITS.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TextField
              select
              label="Reason"
              value={form.reason}
              onChange={(e) =>
                updateForm("reason", e.target.value as MaterialRequestFormData["reason"])
              }
              fullWidth
              size="small"
            >
              <MenuItem value="">Select reason</MenuItem>
              {MATERIAL_REQUEST_REASONS.map((reason) => (
                <MenuItem key={reason} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Urgency"
              value={form.urgency}
              onChange={(e) =>
                updateForm("urgency", e.target.value as MaterialRequestFormData["urgency"])
              }
              fullWidth
              size="small"
            >
              <MenuItem value="">Select urgency</MenuItem>
              {MATERIAL_REQUEST_URGENCIES.map((urgency) => (
                <MenuItem key={urgency} value={urgency}>
                  {urgency}
                </MenuItem>
              ))}
            </TextField>

            <FormControlLabel
              control={
                <Switch
                  checked={form.photoAttached}
                  onChange={(e) => updateForm("photoAttached", e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Camera size={16} />
                  {form.photoAttached ? "Photo attached" : "Attach photo of issue (optional)"}
                </Box>
              }
            />

            <TextField
              label="Notes"
              value={form.notes}
              onChange={(e) => updateForm("notes", e.target.value)}
              placeholder="Additional details..."
              fullWidth
              size="small"
              multiline
              rows={3}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        {submitted ? (
          <Button variant="contained" onClick={onClose}>
            Close
          </Button>
        ) : (
          <>
            <Button onClick={onClose} color="inherit">
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Send size={16} />} onClick={handleSubmit}>
              Submit Request
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
