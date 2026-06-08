import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { Flag, HardHat, MapPin, Package, Users, Wrench } from "lucide-react";
import { formatProjectDate, getProjectStatusConfig } from "../../../../lib/projectHelpers";
import {
  displayValue,
  projectStatusFromApi,
  SECTION_PLACEHOLDERS,
} from "../../../projects/constants/projectConstants";
import type { FieldOperations, Project } from "../../../../types/project";
import {
  getCrewLeader,
  getCrewMembers,
  getJobSiteAddress,
} from "../../lib/fieldOperationsHelpers";
import { MilestonesTasksSection } from "./MilestonesTasksSection";

interface FieldOperationDetailsTabProps {
  project: Project;
  fieldOps: FieldOperations;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const isPlaceholder = !value || value === SECTION_PLACEHOLDERS.project;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: 2,
        py: 1.25,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.8125rem",
          fontWeight: isPlaceholder ? 400 : 600,
          fontStyle: isPlaceholder ? "italic" : "normal",
          color: isPlaceholder ? "text.disabled" : "text.primary",
          textAlign: "right",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box sx={{ width: 4, height: 20, borderRadius: 1, bgcolor: "primary.main" }} />
      <Icon size={16} color="#2E7D32" />
      <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>{title}</Typography>
    </Box>
  );
}

export function FieldOperationDetailsTab({ project, fieldOps }: FieldOperationDetailsTabProps) {
  const statusConfig = getProjectStatusConfig(project.status);
  const crewLeader = useMemo(() => getCrewLeader(project), [project]);
  const crewMembers = useMemo(() => getCrewMembers(project), [project]);
  const jobSiteAddress = useMemo(() => getJobSiteAddress(project), [project]);

  const pulledCount = fieldOps.pickList.filter((item) => item.pulledFromInventory).length;
  const completedActivities = fieldOps.activities.filter(
    (activity) => activity.status === "Completed"
  ).length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box>
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            fontSize: "0.75rem",
            fontWeight: 600,
            bgcolor: statusConfig.bg,
            color: statusConfig.color,
            mb: 1.5,
          }}
        >
          {projectStatusFromApi(project.status)}
        </Box>
        <Typography sx={{ fontSize: "1.375rem", fontWeight: 700, mb: 0.5 }}>
          {project.projectCode}
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          {displayValue(project.customerName)} · Field Operations Overview
        </Typography>
      </Box>

      <Box>
        <SectionHeader title="Work Order Summary" icon={Wrench} />
        <Box sx={{ bgcolor: "grey.50", borderRadius: 2, px: 2.5, py: 0.5 }}>
          <InfoRow label="Work Order #" value={fieldOps.workOrderNumber} />
          <InfoRow
            label="Project Name & Code"
            value={`${project.customerName} (${project.projectCode})`}
          />
          <InfoRow label="Customer Name" value={displayValue(project.customerName)} />
          <InfoRow label="Job Site Address" value={jobSiteAddress} />
          <InfoRow
            label="Planned Start Date"
            value={displayValue(project.plannedStartDate, formatProjectDate)}
          />
          <InfoRow label="Crew Leader" value={crewLeader} />
          <InfoRow
            label="Crew Members"
            value={crewMembers.length > 0 ? crewMembers.join(", ") : "Not assigned"}
          />
          <InfoRow
            label="Special Instructions"
            value={fieldOps.specialInstructions || "No special instructions"}
          />
          <InfoRow
            label="Description"
            value={displayValue(
              project.description,
              undefined,
              SECTION_PLACEHOLDERS.description
            )}
          />
        </Box>
      </Box>

      <Box>
        <SectionHeader title="Milestones & Tasks" icon={Flag} />
        <MilestonesTasksSection project={project} />
      </Box>

      <Box>
        <SectionHeader title="Site & Crew" icon={HardHat} />
        <Box sx={{ display: "grid", gridTemplateColumns: { sm: "1fr 1fr" }, gap: 2 }}>
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <MapPin size={15} color="#2E7D32" />
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>Job Site</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              {jobSiteAddress}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.paper",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <Users size={15} color="#2E7D32" />
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>Assigned Crew</Typography>
            </Box>
            <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
              {crewMembers.length > 0 ? crewMembers.join(", ") : "No crew assigned"}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box>
        <SectionHeader title="Field Operations Status" icon={Package} />
        <Box sx={{ display: "grid", gridTemplateColumns: { sm: "repeat(3, 1fr)" }, gap: 2 }}>
          {[
            {
              label: "Documents & Guides",
              value: `${fieldOps.guideDocuments.length} uploaded`,
            },
            {
              label: "Pick List",
              value: `${pulledCount}/${fieldOps.pickList.length} pulled`,
            },
            {
              label: "Activities",
              value: `${completedActivities}/${fieldOps.activities.length} completed`,
            },
          ].map((stat) => (
            <Box
              key={stat.label}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "#E8F5E9",
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "1.125rem", fontWeight: 700, color: "#2E7D32" }}>
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 0.5 }}>
                {stat.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
