import React, { useMemo, useState } from "react";
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
import { Check, Edit2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { formatProjectDate } from "../../../../lib/projectHelpers";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import type { FieldActivity, FieldOperations, Project } from "../../../../types/project";
import { FIELD_ACTIVITY_STATUS_OPTIONS } from "../../constants/fieldOperationsConstants";
import { getCrewLeader, getCrewMembers } from "../../lib/fieldOperationsHelpers";

interface ActivityTimelineTabProps {
  project: Project;
  fieldOps: FieldOperations;
  onFieldOpsChange: (updates: Partial<FieldOperations>) => void;
}

function displayDate(value: string) {
  return value ? formatProjectDate(value) : "—";
}

export function ActivityTimelineTab({
  project,
  fieldOps,
  onFieldOpsChange,
}: ActivityTimelineTabProps) {
  const assigneeOptions = useMemo(() => {
    const members = getCrewMembers(project);
    const leader = getCrewLeader(project);
    const unique = Array.from(new Set([leader, ...members].filter(Boolean)));
    return unique.length > 0 ? unique : ["Unassigned"];
  }, [project]);

  const dependencyOptions = useMemo(
    () => ["None", ...fieldOps.activities.map((a) => a.activityName)],
    [fieldOps.activities]
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    activityName: string;
    plannedDate: string;
    estimatedDurationDays: string;
    assignedTo: string;
    dependencyName: string;
    status: FieldActivity["status"];
  } | null>(null);

  const [form, setForm] = useState({
    activityName: "",
    plannedDate: "",
    estimatedDurationDays: "",
    assignedTo: assigneeOptions[0] ?? "",
    dependencyName: "None",
    status: FIELD_ACTIVITY_STATUS_OPTIONS[0],
  });

  const getDependencyName = (dependencyId: string) => {
    if (!dependencyId) return "None";
    return fieldOps.activities.find((a) => a.id === dependencyId)?.activityName ?? "None";
  };

  const addActivity = () => {
    if (!form.activityName.trim()) {
      toast.error("Enter activity name");
      return;
    }

    const dependencyActivity = fieldOps.activities.find(
      (a) => a.activityName === form.dependencyName
    );

    const newActivity: FieldActivity = {
      id: `activity-${Date.now()}`,
      activityName: form.activityName.trim(),
      plannedDate: form.plannedDate,
      estimatedDurationDays: Number(form.estimatedDurationDays) || 1,
      assignedTo: form.assignedTo,
      dependencyId: dependencyActivity?.id ?? "",
      status: form.status,
    };

    onFieldOpsChange({
      activities: [...fieldOps.activities, newActivity],
    });

    setForm({
      activityName: "",
      plannedDate: "",
      estimatedDurationDays: "",
      assignedTo: assigneeOptions[0] ?? "",
      dependencyName: "None",
      status: FIELD_ACTIVITY_STATUS_OPTIONS[0],
    });
    toast.success("Activity added");
  };

  const startEdit = (activity: FieldActivity) => {
    setEditingId(activity.id);
    setEditDraft({
      activityName: activity.activityName,
      plannedDate: activity.plannedDate,
      estimatedDurationDays: String(activity.estimatedDurationDays),
      assignedTo: activity.assignedTo,
      dependencyName: getDependencyName(activity.dependencyId),
      status: activity.status,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft(null);
  };

  const saveEdit = () => {
    if (!editingId || !editDraft) return;

    const dependencyActivity = fieldOps.activities.find(
      (a) => a.activityName === editDraft.dependencyName
    );

    onFieldOpsChange({
      activities: fieldOps.activities.map((activity) =>
        activity.id === editingId
          ? {
              ...activity,
              activityName: editDraft.activityName.trim(),
              plannedDate: editDraft.plannedDate,
              estimatedDurationDays: Number(editDraft.estimatedDurationDays) || 1,
              assignedTo: editDraft.assignedTo,
              dependencyId: dependencyActivity?.id ?? "",
              status: editDraft.status,
            }
          : activity
      ),
    });

    cancelEdit();
    toast.success("Activity updated");
  };

  return (
    <Box>
      <WorkspaceSection title="Add Activity">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextFieldInput
              label="Activity Name"
              value={form.activityName}
              onChange={(value) => setForm((prev) => ({ ...prev, activityName: value }))}
              placeholder="e.g. Site Prep, Turf Install"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextFieldInput
              label="Planned Date"
              value={form.plannedDate}
              onChange={(value) => setForm((prev) => ({ ...prev, plannedDate: value }))}
              type="date"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextFieldInput
              label="Estimated Duration (Days)"
              value={form.estimatedDurationDays}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, estimatedDurationDays: value }))
              }
              type="number"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField
              label="Assigned To"
              value={form.assignedTo}
              onChange={(value) => setForm((prev) => ({ ...prev, assignedTo: value }))}
              options={assigneeOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField
              label="Dependency"
              value={form.dependencyName}
              onChange={(value) => setForm((prev) => ({ ...prev, dependencyName: value }))}
              options={dependencyOptions}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <SelectField
              label="Status"
              value={form.status}
              onChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  status: value as typeof form.status,
                }))
              }
              options={FIELD_ACTIVITY_STATUS_OPTIONS}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button variant="contained" startIcon={<Plus size={16} />} onClick={addActivity}>
              Add Activity
            </Button>
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Activity Timeline">
        {fieldOps.activities.length === 0 ? (
          <Typography sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}>
            No activities yet. Add from milestones or create new activities above.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Activity</TableCell>
                <TableCell>Planned Date</TableCell>
                <TableCell>Duration (Days)</TableCell>
                <TableCell>Assigned To</TableCell>
                <TableCell>Dependency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldOps.activities.map((activity) => {
                const isEditing = editingId === activity.id;

                if (isEditing && editDraft) {
                  return (
                    <TableRow key={activity.id} sx={{ bgcolor: "rgba(46,125,50,0.04)" }}>
                      <TableCell>
                        <TextFieldInput
                          label=""
                          value={editDraft.activityName}
                          onChange={(value) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, activityName: value } : prev
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <TextFieldInput
                          label=""
                          value={editDraft.plannedDate}
                          onChange={(value) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, plannedDate: value } : prev
                            )
                          }
                          type="date"
                        />
                      </TableCell>
                      <TableCell>
                        <TextFieldInput
                          label=""
                          value={editDraft.estimatedDurationDays}
                          onChange={(value) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, estimatedDurationDays: value } : prev
                            )
                          }
                          type="number"
                        />
                      </TableCell>
                      <TableCell>
                        <SelectField
                          label=""
                          value={editDraft.assignedTo}
                          onChange={(value) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, assignedTo: value } : prev
                            )
                          }
                          options={assigneeOptions}
                        />
                      </TableCell>
                      <TableCell>
                        <SelectField
                          label=""
                          value={editDraft.dependencyName}
                          onChange={(value) =>
                            setEditDraft((prev) =>
                              prev ? { ...prev, dependencyName: value } : prev
                            )
                          }
                          options={dependencyOptions.filter(
                            (name) => name === "None" || name !== editDraft.activityName
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <SelectField
                          label=""
                          value={editDraft.status}
                          onChange={(value) =>
                            setEditDraft((prev) =>
                              prev
                                ? { ...prev, status: value as FieldActivity["status"] }
                                : prev
                            )
                          }
                          options={FIELD_ACTIVITY_STATUS_OPTIONS}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                          <IconButton size="small" onClick={saveEdit} aria-label="Save activity">
                            <Check size={16} color="#2E7D32" />
                          </IconButton>
                          <IconButton size="small" onClick={cancelEdit} aria-label="Cancel edit">
                            <X size={16} color="#64748B" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                }

                return (
                  <TableRow key={activity.id}>
                    <TableCell sx={{ fontWeight: 600 }}>{activity.activityName}</TableCell>
                    <TableCell>{displayDate(activity.plannedDate)}</TableCell>
                    <TableCell>{activity.estimatedDurationDays}</TableCell>
                    <TableCell>{activity.assignedTo || "—"}</TableCell>
                    <TableCell>{getDependencyName(activity.dependencyId)}</TableCell>
                    <TableCell>{activity.status}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => startEdit(activity)}
                        aria-label="Edit activity"
                      >
                        <Edit2 size={16} color="#2E7D32" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </WorkspaceSection>
    </Box>
  );
}
