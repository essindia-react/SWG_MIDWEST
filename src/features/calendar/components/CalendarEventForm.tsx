import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import {
  TextFieldInput,
  LabeledSelectField,
} from "../../leads/components/workspace/workspaceFields";
import { EVENT_TYPE_OPTIONS } from "../constants/calendarConstants";
import type { CalendarEventType } from "../../../types/calendar";

export interface CalendarEventFormData {
  date: string;
  startTime: string;
  endTime: string;
  type: CalendarEventType;
}

interface CalendarEventFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarEventFormData) => void;
  prefillDate?: string | null;
}

const EMPTY_FORM: CalendarEventFormData = {
  date: "",
  startTime: "09:00",
  endTime: "10:00",
  type: "visit",
};

export function CalendarEventForm({
  open,
  onClose,
  onSubmit,
  prefillDate,
}: CalendarEventFormProps) {
  const [form, setForm] = useState<CalendarEventFormData>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm({
        ...EMPTY_FORM,
        date: prefillDate ?? "",
      });
      setError(null);
    }
  }, [open, prefillDate]);

  const handleChange = <K extends keyof CalendarEventFormData>(
    field: K,
    value: CalendarEventFormData[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = () => {
    if (!form.date) {
      setError("Please select a date.");
      return;
    }
    if (!form.startTime || !form.endTime) {
      setError("Please set start and end times.");
      return;
    }
    if (form.endTime <= form.startTime) {
      setError("End time must be after start time.");
      return;
    }

    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
        New Event
        <Button onClick={onClose} color="inherit" sx={{ minWidth: "auto", p: 0.5 }}>
          <X size={20} />
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid size={{ xs: 12 }}>
            <TextFieldInput
              label="Date"
              type="date"
              value={form.date}
              onChange={(v) => handleChange("date", v)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextFieldInput
              label="Start Time"
              type="time"
              value={form.startTime}
              onChange={(v) => handleChange("startTime", v)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextFieldInput
              label="End Time"
              type="time"
              value={form.endTime}
              onChange={(v) => handleChange("endTime", v)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <LabeledSelectField
              label="Event Type"
              value={form.type}
              onChange={(v) => handleChange("type", v as CalendarEventType)}
              options={EVENT_TYPE_OPTIONS}
              required
            />
          </Grid>
        </Grid>
        {error && (
          <Typography variant="body2" color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Add Event
        </Button>
      </DialogActions>
    </Dialog>
  );
}
