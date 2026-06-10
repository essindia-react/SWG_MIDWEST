import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Box,
  Divider,
} from "@mui/material";
import { Clock, Play, Square, MapPin, Briefcase, FileText } from "lucide-react";
import { useHR } from "../../../hooks/useHR";
import { useProjects } from "../../../hooks/useProjects";
import { SelectField, TextFieldInput } from "../../leads/components/workspace/workspaceFields";
import { WorkType } from "../../../types/hr";
import { toast } from "sonner";

const WORK_TYPES: WorkType[] = [
  "Regular Installation",
  "Travel",
  "Shop Work",
  "Training",
  "Prevailing Wage",
];

export function ClockControl() {
  const { employees, timesheets, clockIn, clockOut } = useHR();
  const { projects } = useProjects();
  
  // For UI only, we'll assume the first employee is the current user
  const currentUser = employees[0];
  
  const activeEntry = useMemo(() => {
    return timesheets.find(ts => ts.employeeId === currentUser?.id && !ts.clockOutTime);
  }, [timesheets, currentUser]);

  const [projectId, setProjectId] = useState("");
  const [workType, setWorkType] = useState<WorkType>("Regular Installation");
  const [notes, setNotes] = useState("");
  const [breakDeduction, setBreakDeduction] = useState(true);
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  useEffect(() => {
    let timer: any;
    if (activeEntry) {
      timer = setInterval(() => {
        const start = new Date(activeEntry.clockInTime).getTime();
        const now = Date.now();
        const diff = now - start;
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setElapsedTime(
          `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
        );
      }, 1000);
    } else {
      setElapsedTime("00:00:00");
    }
    return () => clearInterval(timer);
  }, [activeEntry]);

  const handleClockIn = () => {
    if (!projectId) {
      toast.error("Please select a project");
      return;
    }
    clockIn({
      employeeId: currentUser.id,
      projectId,
      workType,
      clockInTime: new Date().toISOString(),
      clockInLocation: "Columbus HQ",
      breakDeduction,
      notes,
    });
    toast.success("Clocked in successfully");
  };

  const handleClockOut = () => {
    if (!activeEntry) return;
    clockOut(activeEntry.id, "Columbus HQ");
    toast.success("Clocked out successfully");
    setProjectId("");
    setNotes("");
  };

  if (!currentUser) return null;

  return (
    <Card sx={{ borderRadius: 3, border: 1, borderColor: "divider", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
      <CardContent sx={{ p: 4 }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {activeEntry ? "Active Session" : "Start a Shift"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {currentUser.firstName} {currentUser.lastName} • {currentUser.role}
              </Typography>
            </div>
          </div>
          {activeEntry && (
            <div className="text-right">
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#2E7D32", fontFamily: "monospace" }}>
                {elapsedTime}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", tracking: 1 }}>
                Elapsed Time
              </Typography>
            </div>
          )}
        </div>

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: activeEntry ? 12 : 7 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="Select Project"
                  value={activeEntry ? activeEntry.projectId : projectId}
                  onChange={setProjectId}
                  options={projects.map(p => p.id)}
                  disabled={!!activeEntry}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <SelectField
                  label="Work Type"
                  value={activeEntry ? activeEntry.workType : workType}
                  onChange={(v) => setWorkType(v as WorkType)}
                  options={WORK_TYPES}
                  disabled={!!activeEntry}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextFieldInput
                  label="Notes (Optional)"
                  value={activeEntry ? (activeEntry.notes || "") : notes}
                  onChange={setNotes}
                  multiline
                  minRows={2}
                  disabled={!!activeEntry}
                />
              </Grid>
            </Grid>
          </Grid>

          {!activeEntry && (
            <Grid size={{ xs: 12, md: 5 }} className="flex flex-col justify-center">
              <Box sx={{ p: 3, bgcolor: "slate.50", borderRadius: 2, border: "1px dashed", borderColor: "slate-200" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Shift Settings
                </Typography>
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    checked={breakDeduction}
                    onChange={(e) => setBreakDeduction(e.target.checked)}
                    id="break"
                    className="w-4 h-4 text-green-600 rounded border-slate-300 focus:ring-green-500"
                  />
                  <label htmlFor="break" className="text-sm text-slate-600">Auto-deduct 30m break (after 5h)</label>
                </div>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Play className="w-5 h-5" />}
                  onClick={handleClockIn}
                  sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}
                >
                  Clock In
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>

        {activeEntry && (
          <Box sx={{ mt: 4, pt: 4, borderTop: 1, borderColor: "divider" }}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-slate-400" />
                  <div>
                    <Typography variant="caption" color="text.secondary">Started At</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {new Date(activeEntry.clockInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Typography>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <div>
                    <Typography variant="caption" color="text.secondary">Location</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{activeEntry.clockInLocation}</Typography>
                  </div>
                </div>
              </div>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Square className="w-4 h-4 fill-current" />}
                onClick={handleClockOut}
                sx={{ px: 6, py: 1.5, borderRadius: 2, fontWeight: 700 }}
              >
                Clock Out
              </Button>
            </div>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
