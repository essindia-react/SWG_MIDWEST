import React, { useCallback, useEffect, useState } from "react";
import { Box, Button, Chip, IconButton, Typography } from "@mui/material";
import { Edit2, Package, Plus, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { formatProjectDate } from "../../../lib/projectHelpers";
import type { Project, ProjectMilestone, ProjectTask } from "../../../types/project";
import { getMilestoneAssignedPickItems } from "../lib/taskPickListHelpers";
import { processPickListItemPull } from "../../../lib/inventoryIntegration";
import {
  addPickListItem,
  getTaskPickList,
  getTaskPickListCount,
  removePickListItem,
  seedTaskPickListsFromProjects,
  updatePickListItem,
} from "../lib/taskManagementPickListStore";
import type {
  TaskManagementPickListFormData,
  TaskManagementPickListItem,
} from "../types/taskManagementPickList";
import { TaskPickListModal } from "./TaskPickListModal";
import { TaskRowCard } from "./TaskRowCard";

interface TaskMilestonePickListTabProps {
  project: Project;
  milestone: ProjectMilestone;
}

function PickListSummary({
  projectId,
  milestoneId,
  taskId,
}: {
  projectId: string;
  milestoneId: string;
  taskId: string;
}) {
  const items = getTaskPickList(projectId, milestoneId, taskId);
  const count = items.length;

  if (count === 0) {
    return (
      <Typography sx={{ fontSize: "0.75rem", color: "text.disabled", fontStyle: "italic" }}>
        Click to manage pick list for this task
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
        {count} item{count !== 1 ? "s" : ""} in pick list
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {items.slice(0, 3).map((item) => (
          <Chip
            key={item.id}
            label={`${item.itemName} (${item.quantityRequired} ${item.unit})`}
            size="small"
            sx={{ height: 22, fontSize: "0.6875rem", maxWidth: "100%" }}
          />
        ))}
        {count > 3 && (
          <Chip label={`+${count - 3} more`} size="small" sx={{ height: 22, fontSize: "0.6875rem" }} />
        )}
      </Box>
    </Box>
  );
}

function TaskPickListSection({
  project,
  milestoneId,
  milestoneName,
  taskId,
  onItemsChange,
}: {
  project: Project;
  milestoneId: string;
  milestoneName: string;
  taskId: string;
  onItemsChange: () => void;
}) {
  const projectId = project.id;
  const task = project.milestones
    .find((milestone) => milestone.id === milestoneId)
    ?.tasks.find((entry) => entry.id === taskId);
  const availableItems = getMilestoneAssignedPickItems(project, milestoneId);
  const [items, setItems] = useState<TaskManagementPickListItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TaskManagementPickListItem | null>(null);

  const loadItems = useCallback(() => {
    setItems(getTaskPickList(projectId, milestoneId, taskId));
  }, [projectId, milestoneId, taskId]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleSave = (data: TaskManagementPickListFormData) => {
    const qty = Number(data.quantityRequired);
    if (editingItem) {
      const updatedItem: TaskManagementPickListItem = {
        ...editingItem,
        fieldName: data.fieldName,
        itemName: data.itemName,
        sku: data.sku,
        quantityRequired: qty || 0,
        unit: data.unit,
        category: data.category,
        sourceLineId: data.sourceLineId,
        pulledFromInventory: data.pulledFromInventory,
        notes: data.notes,
      };
      updatePickListItem(projectId, milestoneId, taskId, editingItem.id, updatedItem);
      if (data.pulledFromInventory) {
        processPickListItemPull(project, taskId, updatedItem, task?.assignedTo);
      }
      toast.success(data.pulledFromInventory ? `${data.itemName} updated & pulled` : "Pick list item updated");
    } else {
      const newItem = addPickListItem(projectId, milestoneId, taskId, {
        fieldName: data.fieldName,
        itemName: data.itemName,
        sku: data.sku,
        quantityRequired: qty || 0,
        unit: data.unit,
        category: data.category,
        sourceLineId: data.sourceLineId,
        pulledFromInventory: data.pulledFromInventory,
        notes: data.notes,
      });
      if (data.pulledFromInventory) {
        processPickListItemPull(project, taskId, newItem, task?.assignedTo);
      }
      toast.success(data.pulledFromInventory ? `${data.itemName} added & pulled` : "Pick list item added");
    }
    setEditingItem(null);
    loadItems();
    onItemsChange();
  };

  const handleDelete = (itemId: string) => {
    removePickListItem(projectId, milestoneId, taskId, itemId);
    toast.success("Pick list item removed");
    loadItems();
    onItemsChange();
  };

  return (
    <Box sx={{ pt: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary" }}>
            Pick List Items
          </Typography>
          <Typography sx={{ fontSize: "0.6875rem", color: "text.disabled", mt: 0.25 }}>
            From project budget assigned to this milestone ({availableItems.length} item
            {availableItems.length !== 1 ? "s" : ""} available)
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<Plus size={14} />}
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
          sx={{ alignSelf: { xs: "stretch", sm: "auto" } }}
        >
          Add Item
        </Button>
      </Box>

      {items.length === 0 ? (
        <Box
          sx={{
            py: 3,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            borderStyle: "dashed",
            bgcolor: "grey.50",
          }}
        >
          <Package size={20} style={{ margin: "0 auto 8px", opacity: 0.4 }} />
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
            No pick list items for this task yet. Add from the {availableItems.length} material
            {availableItems.length !== 1 ? "s" : ""}/equipment assigned to this milestone.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {items.map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                bgcolor: "grey.50",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: "0.6875rem", fontWeight: 600, color: "text.secondary" }}>
                    {item.fieldName}
                  </Typography>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>{item.itemName}</Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.5, alignItems: "center" }}>
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                      SKU: {item.sku || "—"}
                    </Typography>
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary" }}>
                      · {item.quantityRequired} {item.unit}
                    </Typography>
                    <Chip
                      label={item.category}
                      size="small"
                      sx={{ height: 20, fontSize: "0.625rem", fontWeight: 600 }}
                    />
                    <Chip
                      label={item.pulledFromInventory ? "Pulled" : "Not Pulled"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.625rem",
                        fontWeight: 600,
                        bgcolor: item.pulledFromInventory ? "#E8F5E9" : "#F1F5F9",
                        color: item.pulledFromInventory ? "#2E7D32" : "#64748B",
                      }}
                    />
                  </Box>
                  {item.notes && (
                    <Typography sx={{ fontSize: "0.6875rem", color: "text.secondary", mt: 0.5 }}>
                      {item.notes}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", gap: 0.25, flexShrink: 0 }}>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingItem(item);
                      setModalOpen(true);
                    }}
                  >
                    <Edit2 size={14} />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      )}

      <TaskPickListModal
        open={modalOpen}
        item={editingItem}
        availableItems={availableItems}
        defaultFieldName={milestoneName}
        onClose={() => {
          setModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
      />
    </Box>
  );
}

function TaskPickListRow({
  task,
  project,
  milestoneId,
  milestoneName,
  expanded,
  onToggle,
  refreshKey,
  onItemsChange,
}: {
  task: ProjectTask;
  project: Project;
  milestoneId: string;
  milestoneName: string;
  expanded: boolean;
  onToggle: () => void;
  refreshKey: number;
  onItemsChange: () => void;
}) {
  const projectId = project.id;
  const itemCount = getTaskPickListCount(projectId, milestoneId, task.id);

  return (
    <TaskRowCard
      title={task.name}
      expanded={expanded}
      onToggle={onToggle}
      subtitle={
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 0.5 }}>
          <Typography
            sx={{ fontSize: "0.75rem", color: "text.secondary", display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <User size={12} />
            {task.assignedTo || "Unassigned"}
          </Typography>
          <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
            {formatProjectDate(task.plannedStartDate)} – {formatProjectDate(task.plannedEndDate)}
          </Typography>
          {itemCount > 0 && !expanded && (
            <Chip
              label={`${itemCount} pick list item${itemCount !== 1 ? "s" : ""}`}
              size="small"
              sx={{ height: 20, fontSize: "0.625rem", fontWeight: 600 }}
            />
          )}
        </Box>
      }
      summary={
        <PickListSummary
          key={refreshKey}
          projectId={projectId}
          milestoneId={milestoneId}
          taskId={task.id}
        />
      }
    >
      <TaskPickListSection
        project={project}
        milestoneId={milestoneId}
        milestoneName={milestoneName}
        taskId={task.id}
        onItemsChange={onItemsChange}
      />
    </TaskRowCard>
  );
}

export function TaskMilestonePickListTab({ project, milestone }: TaskMilestonePickListTabProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    seedTaskPickListsFromProjects([project]);
    setRefreshKey((k) => k + 1);
  }, [project]);

  const handleItemsChange = () => {
    setRefreshKey((k) => k + 1);
  };

  if (milestone.tasks.length === 0) {
    return (
      <Box
        sx={{
          py: 6,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          No tasks in this milestone. Add tasks to manage pick lists.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 2 }}>
        Pick lists use materials and equipment assigned to this milestone in project management.
        Each task tracks what was pulled for the job.
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {milestone.tasks.map((task) => (
          <TaskPickListRow
            key={task.id}
            task={task}
            project={project}
            milestoneId={milestone.id}
            milestoneName={milestone.name}
            expanded={expandedTaskId === task.id}
            onToggle={() => setExpandedTaskId(expandedTaskId === task.id ? null : task.id)}
            refreshKey={refreshKey}
            onItemsChange={handleItemsChange}
          />
        ))}
      </Box>
    </Box>
  );
}
