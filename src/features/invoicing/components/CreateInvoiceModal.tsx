import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Typography,
} from "@mui/material";
import { X } from "lucide-react";
import { useProjects } from "../../../hooks/useProjects";
import { resolveInvoiceEditContext } from "../../../lib/invoiceHelpers";
import type {
  Invoice,
  MilestoneCompletionRecord,
} from "../../../types/invoice";
import type { Project, ProjectMilestone } from "../../../types/project";
import { DEPARTMENT_CHECKLIST_ITEMS } from "../constants/invoicingConstants";
import { LabeledSelectField } from "../../leads/components/workspace/workspaceFields";
import { CreateInvoiceForm } from "./CreateInvoiceForm";

interface CreateInvoiceModalProps {
  open: boolean;
  projects: Project[];
  invoice: Invoice | null;
  onClose: () => void;
  onSaved: (invoice: Invoice) => void;
  onSent: (invoice: Invoice) => void;
}

function createDefaultCompletionRecord(
  project: Project,
  milestone: ProjectMilestone,
  existing?: MilestoneCompletionRecord,
): MilestoneCompletionRecord {
  if (existing) return existing;

  return {
    completionPct: 100,
    markedCompleteBy: milestone.assignedTo || project.projectManager,
    completionDate: new Date().toISOString().slice(0, 10),
    completionPhotos: ["milestone-completion.jpg"],
    checklistSignedOff: Object.fromEntries(
      DEPARTMENT_CHECKLIST_ITEMS.map((item) => [item, true]),
    ),
  };
}

export function CreateInvoiceModal({
  open,
  projects,
  invoice,
  onClose,
  onSaved,
  onSent,
}: CreateInvoiceModalProps) {
  const { getProjectById } = useProjects();

  const [projectId, setProjectId] = useState("");
  const [milestoneId, setMilestoneId] = useState("");

  useEffect(() => {
    if (!open) return;

    if (invoice) {
      setProjectId(invoice.projectId);
      setMilestoneId(invoice.milestoneId);
      return;
    }

    const defaultProjectId = projects[0]?.id ?? "";
    setProjectId(defaultProjectId);
    const defaultProject = projects.find(
      (project) => project.id === defaultProjectId,
    );
    setMilestoneId(defaultProject?.milestones[0]?.id ?? "");
  }, [open, invoice, projects]);

  const editContext = useMemo(() => {
    if (!invoice) return null;
    return resolveInvoiceEditContext(invoice, getProjectById);
  }, [invoice, getProjectById]);

  const newInvoiceContext = useMemo(() => {
    if (invoice) return null;

    const project =
      projects.find((item) => item.id === projectId) ??
      getProjectById(projectId);
    const milestone = project?.milestones.find(
      (item) => item.id === milestoneId,
    );

    if (!project || !milestone) return null;
    return { project, milestone };
  }, [invoice, projects, projectId, milestoneId, getProjectById]);

  const formContext = invoice ? editContext : newInvoiceContext;

  const projectOptions = useMemo(() => {
    const options = projects.map((project) => ({
      value: project.id,
      label: `${project.projectCode} — ${project.customerName}`,
    }));

    if (
      invoice &&
      !options.some((option) => option.value === invoice.projectId)
    ) {
      const linkedProject = getProjectById(invoice.projectId);
      options.unshift({
        value: invoice.projectId,
        label: linkedProject
          ? `${linkedProject.projectCode} — ${linkedProject.customerName}`
          : `${invoice.projectName} — ${invoice.billToName}`,
      });
    }

    return options;
  }, [projects, invoice, getProjectById]);

  const milestoneOptions = useMemo(() => {
    if (invoice && formContext) {
      return [
        {
          value: formContext.milestone.id,
          label: formContext.milestone.name,
        },
      ];
    }

    const project =
      projects.find((item) => item.id === projectId) ??
      getProjectById(projectId);

    return (project?.milestones ?? []).map((milestone) => ({
      value: milestone.id,
      label: milestone.name,
    }));
  }, [invoice, formContext, projects, projectId, getProjectById]);

  const handleProjectChange = (value: string) => {
    setProjectId(value);
    const project =
      projects.find((item) => item.id === value) ?? getProjectById(value);
    setMilestoneId(project?.milestones[0]?.id ?? "");
  };

  const isEditing = Boolean(invoice);
  const lockPickers = isEditing;
  const canShowForm = Boolean(formContext);

  const completionRecord =
    formContext &&
    createDefaultCompletionRecord(
      formContext.project,
      formContext.milestone,
      invoice?.completionRecord,
    );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          pr: 1,
          pb: 1,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "1.125rem", fontWeight: 700 }}>
            {isEditing
              ? `Edit Invoice ${invoice?.invoiceNumber}`
              : "New Invoice"}
          </Typography>
          <Typography
            sx={{ fontSize: "0.8125rem", color: "text.secondary", mt: 0.25 }}
          >
            {isEditing
              ? "Update invoice details or send to client"
              : "Select project and milestone, then complete invoice details"}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" aria-label="Close">
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={2} sx={{ mb: canShowForm ? 2 : 0 }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LabeledSelectField
              label="Project"
              value={projectId}
              onChange={handleProjectChange}
              options={projectOptions}
              disabled={lockPickers}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LabeledSelectField
              label="Milestone"
              value={milestoneId}
              onChange={setMilestoneId}
              options={milestoneOptions}
              disabled={lockPickers || milestoneOptions.length === 0}
            />
          </Grid>
        </Grid>

        {canShowForm && completionRecord && formContext && (
          <CreateInvoiceForm
            variant="modal"
            project={formContext.project}
            milestone={formContext.milestone}
            completionRecord={completionRecord}
            invoice={invoice}
            onClose={onClose}
            onSaved={onSaved}
            onSent={onSent}
          />
        )}

        {!canShowForm && (
          <Typography
            sx={{ fontSize: "0.8125rem", color: "text.secondary", py: 2 }}
          >
            Select a project with at least one milestone to continue.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
