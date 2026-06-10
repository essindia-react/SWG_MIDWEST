import React, { useMemo, type ReactNode } from "react";
import { Box, Button, Typography } from "@mui/material";
import {
  Edit2,
  FileText,
  Flag,
  Mail,
  MapPin,
  Paperclip,
  Phone,
  Users,
} from "lucide-react";
import {
  buildProjectTimeline,
  formatProjectDate,
  getProjectStatusConfig,
} from "../../../../lib/projectHelpers";
import {
  calculateBudgetSummary,
  formatBudgetCurrency,
  formatBudgetPercent,
} from "../../../../lib/budgetHelpers";
import { formatCurrency } from "../../../../lib/formatters";
import {
  displayValue,
  getCustomerById,
  isPlaceholderValue,
  milestoneStatusFromApi,
  projectStatusFromApi,
  SECTION_PLACEHOLDERS,
  taskStatusFromApi,
} from "../../constants/projectConstants";
import type { Project } from "../../../../types/project";
interface ProjectDetailsTabProps {
  project: Project;
  onEditProject: () => void;
}

function InfoRow({
  label,
  value,
  placeholder = SECTION_PLACEHOLDERS.project,
}: {
  label: string;
  value: string;
  placeholder?: string;
}) {
  const isPlaceholder = isPlaceholderValue(value, placeholder);

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

function SectionHeader({ title }: { title: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box sx={{ width: 4, height: 20, borderRadius: 1, bgcolor: "primary.main" }} />
      <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>{title}</Typography>
    </Box>
  );
}

function PlaceholderText({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}
    >
      {children}
    </Typography>
  );
}

export function ProjectDetailsTab({ project, onEditProject }: ProjectDetailsTabProps) {
  const customer = useMemo(
    () => getCustomerById(project.customerId),
    [project.customerId]
  );
  const statusConfig = getProjectStatusConfig(project.status);
  const timeline = useMemo(() => buildProjectTimeline(project), [project]);
  const budgetSummary = useMemo(() => calculateBudgetSummary(project), [project]);
  const hasBudgetData = budgetSummary.totalEstimatedBudget > 0;

  const uploadedDocuments = useMemo(
    () => project.documents.filter((doc) => doc.uploaded),
    [project.documents]
  );

  const documentsByCategory = useMemo(() => {
    const groups: Record<string, typeof uploadedDocuments> = {};
    uploadedDocuments.forEach((doc) => {
      if (!groups[doc.category]) groups[doc.category] = [];
      groups[doc.category].push(doc);
    });
    return groups;
  }, [uploadedDocuments]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
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
            {displayValue(project.customerName)} · {displayValue(project.projectType)}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Edit2 size={14} />}
          onClick={onEditProject}
        >
          Edit Project
        </Button>
      </Box>

      <Box>
        <SectionHeader title="Project Information" />
        <Box sx={{ bgcolor: "grey.50", borderRadius: 2, px: 2.5, py: 0.5 }}>
          <InfoRow label="Project Code" value={project.projectCode} />
          <InfoRow
            label="Project Date"
            value={displayValue(project.projectDate, formatProjectDate)}
          />
          <InfoRow label="Customer Name" value={displayValue(project.customerName)} />
          <InfoRow
            label="Planned Start"
            value={displayValue(project.plannedStartDate, formatProjectDate)}
          />
          <InfoRow
            label="Planned End"
            value={displayValue(project.plannedEndDate, formatProjectDate)}
          />
          <InfoRow
            label="Actual Start"
            value={displayValue(project.actualStartDate, formatProjectDate)}
          />
          <InfoRow
            label="Actual End"
            value={displayValue(project.actualEndDate, formatProjectDate)}
          />
          <InfoRow
            label="Project Value"
            value={
              project.projectValue
                ? formatCurrency(project.projectValue)
                : SECTION_PLACEHOLDERS.project
            }
          />
          <InfoRow
            label="Project Manager"
            value={displayValue(
              project.projectManager,
              undefined,
              SECTION_PLACEHOLDERS.projectManager
            )}
          />
          <InfoRow
            label="Description"
            value={displayValue(
              project.description,
              undefined,
              SECTION_PLACEHOLDERS.description
            )}
          />
          <InfoRow
            label="Remarks/Notes"
            value={displayValue(project.remarks, undefined, SECTION_PLACEHOLDERS.remarks)}
          />
        </Box>
      </Box>

      {customer && (
        <Box>
          <SectionHeader title="Customer Details" />
          <Box sx={{ bgcolor: "grey.50", borderRadius: 2, px: 2.5, py: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Mail size={15} color="#2E7D32" />
                <Typography sx={{ fontSize: "0.8125rem" }}>{customer.email}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Phone size={15} color="#2E7D32" />
                <Typography sx={{ fontSize: "0.8125rem" }}>{customer.phone}</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                <MapPin size={15} color="#2E7D32" style={{ marginTop: 2 }} />
                <Typography sx={{ fontSize: "0.8125rem" }}>{customer.address}</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      )}

      <Box>
        <SectionHeader title="Budgeting" />
        {hasBudgetData ? (
          <Box sx={{ bgcolor: "grey.50", borderRadius: 2, px: 2.5, py: 0.5 }}>
            <InfoRow
              label="Materials Cost"
              value={formatBudgetCurrency(budgetSummary.totalMaterialCost)}
            />
            <InfoRow
              label="Labor Cost"
              value={formatBudgetCurrency(budgetSummary.totalLaborCost)}
            />
            <InfoRow
              label="Equipment Cost"
              value={formatBudgetCurrency(budgetSummary.totalEquipmentCost)}
            />
            <InfoRow
              label="Overhead Expenses"
              value={formatBudgetCurrency(budgetSummary.totalOtherExpenses)}
            />
            <InfoRow
              label="Total Estimated Budget"
              value={formatBudgetCurrency(budgetSummary.totalEstimatedBudget)}
            />
            <InfoRow
              label="Contract Value"
              value={
                budgetSummary.contractValue > 0
                  ? formatBudgetCurrency(budgetSummary.contractValue)
                  : SECTION_PLACEHOLDERS.project
              }
            />
            <InfoRow
              label="Estimated Gross Profit"
              value={formatBudgetCurrency(budgetSummary.estimatedGrossProfit)}
            />
            <InfoRow
              label="Estimated Profit Margin"
              value={
                budgetSummary.contractValue > 0
                  ? formatBudgetPercent(budgetSummary.estimatedProfitMargin)
                  : SECTION_PLACEHOLDERS.project
              }
            />
          </Box>
        ) : (
          <PlaceholderText>{SECTION_PLACEHOLDERS.budget}</PlaceholderText>
        )}
      </Box>

      <Box>
        <SectionHeader title="Assigned Team" />
        {project.teamAssignments.length === 0 ? (
          <PlaceholderText>{SECTION_PLACEHOLDERS.team}</PlaceholderText>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
            {project.teamAssignments.map((member) => (
              <Box
                key={member.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2,
                  py: 1.25,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                }}
              >
                <Users size={15} color="#2E7D32" />
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                    {member.userName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                    {displayValue(member.role, undefined, SECTION_PLACEHOLDERS.team)} ·{" "}
                    {displayValue(member.startDate, formatProjectDate, SECTION_PLACEHOLDERS.team)}
                    {member.endDate ? ` – ${formatProjectDate(member.endDate)}` : ""}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box>
        <SectionHeader title="Milestones & Tasks" />
        {project.milestones.length === 0 ? (
          <PlaceholderText>{SECTION_PLACEHOLDERS.milestones}</PlaceholderText>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {project.milestones.map((milestone) => {
              const msStatus = getProjectStatusConfig(
                milestone.status as "completed" | "in-progress" | "on-hold"
              );
              return (
                <Box
                  key={milestone.id}
                  sx={{
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.5,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Flag size={16} color="#2E7D32" />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        {milestone.name}
                      </Typography>
                      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                        {displayValue(
                          milestone.assignedTo,
                          undefined,
                          SECTION_PLACEHOLDERS.milestones
                        )}{" "}
                        ·{" "}
                        {displayValue(
                          milestone.plannedStartDate,
                          formatProjectDate,
                          SECTION_PLACEHOLDERS.milestones
                        )}
                        {milestone.plannedEndDate
                          ? ` – ${formatProjectDate(milestone.plannedEndDate)}`
                          : ""}
                      </Typography>
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        px: 1.25,
                        py: 0.25,
                        borderRadius: 999,
                        fontSize: "0.6875rem",
                        fontWeight: 600,
                        bgcolor: msStatus.bg,
                        color: msStatus.color,
                      }}
                    >
                      {milestoneStatusFromApi(milestone.status)}
                    </Box>
                  </Box>

                  <Box sx={{ borderTop: 1, borderColor: "divider", bgcolor: "grey.50" }}>
                    {milestone.tasks.length === 0 ? (
                      <Box sx={{ px: 2, pl: 4, py: 1.25 }}>
                        <PlaceholderText>{SECTION_PLACEHOLDERS.tasks}</PlaceholderText>
                      </Box>
                    ) : (
                      milestone.tasks.map((task) => (
                        <Box
                          key={task.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            px: 2,
                            pl: 4,
                            py: 1.25,
                            borderTop: 1,
                            borderColor: "divider",
                          }}
                        >
                          <FileText size={14} color="#64748B" />
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                              {task.name}
                            </Typography>
                            <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                              {displayValue(
                                task.assignedTo,
                                undefined,
                                SECTION_PLACEHOLDERS.tasks
                              )}
                              {task.estimateEffortHrs
                                ? ` · ${task.estimateEffortHrs}h`
                                : ""}
                            </Typography>
                          </Box>
                          <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                            {taskStatusFromApi(task.status)}
                          </Typography>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}
      </Box>

      <Box>
        <SectionHeader title="Attachments" />
        {uploadedDocuments.length === 0 ? (
          <PlaceholderText>{SECTION_PLACEHOLDERS.attachments}</PlaceholderText>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {Object.entries(documentsByCategory).map(([category, docs]) => (
              <Box key={category}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    mb: 1,
                  }}
                >
                  {category}
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                  {docs.map((doc) => (
                    <Box
                      key={doc.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        px: 2,
                        py: 1.25,
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Paperclip size={15} color="#2E7D32" />
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 500 }}>
                          {doc.fileName || doc.label}
                        </Typography>
                        <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                          {doc.label}
                          {doc.uploadedAt
                            ? ` · Attached ${formatProjectDate(doc.uploadedAt.slice(0, 10))}`
                            : ""}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>

      <Box>
        <SectionHeader title="Project Timeline" />
        <Box sx={{ position: "relative", pl: 3 }}>
          <Box
            sx={{
              position: "absolute",
              left: 11,
              top: 8,
              bottom: 8,
              width: 2,
              bgcolor: "#E2E8F0",
              borderRadius: 1,
            }}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {timeline.map((item) => {
              const Icon = item.icon;
              return (
                <Box key={item.id} sx={{ display: "flex", gap: 2, position: "relative" }}>
                  <Box
                    sx={{
                      position: "absolute",
                      left: -21,
                      top: 2,
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      bgcolor: item.iconBg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      zIndex: 1,
                    }}
                  >
                    <Icon size={12} color={item.iconColor} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 2,
                        mb: 0.25,
                      }}
                    >
                      <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.6875rem",
                          color: "text.secondary",
                          flexShrink: 0,
                        }}
                      >
                        {item.time}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.5 }}
                    >
                      {item.body}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
