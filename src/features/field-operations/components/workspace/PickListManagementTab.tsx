import React from "react";
import {
  Box,
  Checkbox,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import type { FieldOperations, PickListCategory, PickListItem } from "../../../../types/project";

interface PickListManagementTabProps {
  fieldOps: FieldOperations;
  onFieldOpsChange: (updates: Partial<FieldOperations>) => void;
}

const CATEGORY_COLORS: Record<PickListCategory, { bg: string; color: string }> = {
  Material: { bg: "#E8F5E9", color: "#2E7D32" },
  Equipment: { bg: "#E3F2FD", color: "#1565C0" },
  Overhead: { bg: "#FFF3E0", color: "#E65100" },
};

export function PickListManagementTab({
  fieldOps,
  onFieldOpsChange,
}: PickListManagementTabProps) {
  const updateItem = (id: string, updates: Partial<PickListItem>) => {
    onFieldOpsChange({
      pickList: fieldOps.pickList.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    });
  };

  const handleInventoryToggle = (item: PickListItem, pulled: boolean) => {
    updateItem(item.id, { pulledFromInventory: pulled });
    if (pulled) {
      toast.success(`${item.itemName} marked as pulled from inventory`);
    }
  };

  return (
    <Box>
      <WorkspaceSection title="Pick List">
        {fieldOps.pickList.length === 0 ? (
          <Typography sx={{ fontSize: "0.875rem", color: "text.disabled", fontStyle: "italic" }}>
            No budget items found. Add materials, equipment, or overhead in Project Management to
            populate the pick list.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell>Item Name</TableCell>
                <TableCell>SKU / Type</TableCell>
                <TableCell>Quantity Required</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell align="center">Pulled from Inventory</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fieldOps.pickList.map((item) => {
                const categoryStyle = CATEGORY_COLORS[item.category ?? "Material"];
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Chip
                        label={item.category ?? "Material"}
                        size="small"
                        sx={{
                          bgcolor: categoryStyle.bg,
                          color: categoryStyle.color,
                          fontWeight: 600,
                          fontSize: "0.6875rem",
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{item.itemName}</TableCell>
                    <TableCell>{item.sku || "—"}</TableCell>
                    <TableCell>{item.quantityRequired}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={item.pulledFromInventory}
                        onChange={(e) => handleInventoryToggle(item, e.target.checked)}
                        sx={{ color: "#2E7D32", "&.Mui-checked": { color: "#2E7D32" } }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        variant="outlined"
                        value={item.notes}
                        onChange={(e) => updateItem(item.id, { notes: e.target.value })}
                        placeholder="Substitution notes"
                        fullWidth
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </WorkspaceSection>

      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
        Pick list includes materials, equipment, and overhead from the project budget. Checking
        &quot;Pulled from Inventory&quot; will update inventory on confirmation when saved.
      </Typography>
    </Box>
  );
}
