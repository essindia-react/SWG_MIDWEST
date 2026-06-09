import React, { useCallback, useState } from "react";
import { Box, Typography } from "@mui/material";
import { useInvoicesWithProjects } from "../../../hooks/useInvoices";
import type { ProjectMilestone } from "../../../types/project";
import { InvoicingMetricsDashboard } from "./InvoicingMetricsDashboard";
import { InvoicingMilestoneList } from "./InvoicingMilestoneList";
import { InvoicingMilestonePanel } from "./InvoicingMilestonePanel";

interface SelectedMilestone {
  projectId: string;
  milestone: ProjectMilestone;
}

export function InvoicingView() {
  const { projects, invoices } = useInvoicesWithProjects();
  const [selected, setSelected] = useState<SelectedMilestone | null>(null);

  const selectedProject = selected
    ? projects.find((p) => p.id === selected.projectId)
    : undefined;

  const handleMilestoneClick = useCallback((projectId: string, milestone: ProjectMilestone) => {
    setSelected({ projectId, milestone });
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelected(null);
  }, []);

  return (
    <Box sx={{ position: "relative", flex: 1, overflow: "auto", p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, mb: 0.5 }}>
          Invoicing & Milestone Payments
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary", mb: 3 }}>
          Milestone reached → marked complete → invoice generated → sent to client → payment
          recorded
        </Typography>

        <InvoicingMetricsDashboard projects={projects} invoices={invoices} />
        <InvoicingMilestoneList projects={projects} onMilestoneClick={handleMilestoneClick} />
      </Box>

      {selected && selectedProject && (
        <InvoicingMilestonePanel
          project={selectedProject}
          milestone={selected.milestone}
          onClose={handleClosePanel}
        />
      )}
    </Box>
  );
}
