import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  SelectField,
  TextFieldInput,
} from "../../../leads/components/workspace/workspaceFields";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import { useConfirmDialog } from "../../../../components/ui/ConfirmDialog";
import { SECTION_PLACEHOLDERS, TEAM_ROLES, TEAM_USERS } from "../../constants/projectConstants";
import type { Project, TeamAssignment } from "../../../../types/project";

interface AssignTeamsTabProps {
  project: Project;
  onAddAssignment: (input: {
    userId: string;
    userName: string;
    role: string;
    startDate: string;
    endDate: string;
  }) => void;
  onUpdateAssignment: (
    assignmentId: string,
    updates: {
      userId?: string;
      userName?: string;
      role?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => void;
  onRemoveAssignment: (assignmentId: string) => void;
}

const EMPTY_FORM = {
  userName: "",
  role: "",
  startDate: "",
  endDate: "",
};

export function AssignTeamsTab({
  project,
  onAddAssignment,
  onUpdateAssignment,
  onRemoveAssignment,
}: AssignTeamsTabProps) {
  const { requestConfirm, confirmDialog } = useConfirmDialog();
  const [form, setForm] = useState(EMPTY_FORM);
  const [editOpen, setEditOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<TeamAssignment | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);

  const handleAdd = () => {
    if (!form.userName || !form.role || !form.startDate) {
      toast.error("Please fill User, Role, and Start Date");
      return;
    }
    const user = TEAM_USERS.find((u) => u.name === form.userName);
    onAddAssignment({
      userId: user?.id ?? form.userName,
      userName: form.userName,
      role: form.role,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    setForm(EMPTY_FORM);
    toast.success("Team member assigned");
  };

  const openEdit = (assignment: TeamAssignment) => {
    setEditingAssignment(assignment);
    setEditForm({
      userName: assignment.userName,
      role: assignment.role,
      startDate: assignment.startDate,
      endDate: assignment.endDate,
    });
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editingAssignment || !editForm.userName || !editForm.role || !editForm.startDate) {
      toast.error("Please fill User, Role, and Start Date");
      return;
    }
    const user = TEAM_USERS.find((u) => u.name === editForm.userName);
    onUpdateAssignment(editingAssignment.id, {
      userId: user?.id ?? editForm.userName,
      userName: editForm.userName,
      role: editForm.role,
      startDate: editForm.startDate,
      endDate: editForm.endDate,
    });
    setEditOpen(false);
    setEditingAssignment(null);
    toast.success("Team member updated");
  };

  return (
    <>
      <WorkspaceSection title="Assign Team Member">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="User"
              value={form.userName}
              onChange={(v) => setForm((prev) => ({ ...prev, userName: v }))}
              options={TEAM_USERS.map((u) => u.name)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <SelectField
              label="Role"
              value={form.role}
              onChange={(v) => setForm((prev) => ({ ...prev, role: v }))}
              options={TEAM_ROLES}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="Start Date"
              type="date"
              value={form.startDate}
              onChange={(v) => setForm((prev) => ({ ...prev, startDate: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 3 }}>
            <TextFieldInput
              label="End Date"
              type="date"
              value={form.endDate}
              onChange={(v) => setForm((prev) => ({ ...prev, endDate: v }))}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Plus size={16} />}
              onClick={handleAdd}
            >
              Add to Team
            </Button>
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Assigned Team">
        {project.teamAssignments.length === 0 ? (
          <Typography color="text.disabled" sx={{ fontSize: "0.875rem", fontStyle: "italic" }}>
            {SECTION_PLACEHOLDERS.team}
          </Typography>
        ) : (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, width: 88 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {project.teamAssignments.map((assignment) => (
                  <TableRow key={assignment.id} hover>
                    <TableCell>{assignment.userName}</TableCell>
                    <TableCell>{assignment.role || SECTION_PLACEHOLDERS.team}</TableCell>
                    <TableCell>{assignment.startDate || SECTION_PLACEHOLDERS.team}</TableCell>
                    <TableCell>{assignment.endDate || SECTION_PLACEHOLDERS.team}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => openEdit(assignment)}
                        aria-label="Edit assignment"
                      >
                        <Edit2 size={16} color="#2E7D32" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          requestConfirm({
                            title: "Remove Team Member?",
                            description: `Are you sure you want to remove ${assignment.userName} from this project team? This action cannot be undone.`,
                            confirmLabel: "Remove",
                            onConfirm: () => {
                              onRemoveAssignment(assignment.id);
                              toast.success("Team member removed");
                            },
                          })
                        }
                        aria-label="Remove assignment"
                      >
                        <Trash2 size={16} color="#DC2626" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </WorkspaceSection>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Edit Team Assignment</DialogTitle>
        <DialogContent>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="User"
                value={editForm.userName}
                onChange={(v) => setEditForm((p) => ({ ...p, userName: v }))}
                options={TEAM_USERS.map((u) => u.name)}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Role"
                value={editForm.role}
                onChange={(v) => setEditForm((p) => ({ ...p, role: v }))}
                options={TEAM_ROLES}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Start Date"
                type="date"
                value={editForm.startDate}
                onChange={(v) => setEditForm((p) => ({ ...p, startDate: v }))}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="End Date"
                type="date"
                value={editForm.endDate}
                onChange={(v) => setEditForm((p) => ({ ...p, endDate: v }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleEditSave}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
      {confirmDialog}
    </>
  );
}
