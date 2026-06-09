import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import { SWAP_STATUS_COLORS } from "../../constants/inventoryConstants";
import { formatCurrency, formatDate, formatDateTime } from "../../lib/inventoryHelpers";
import type { ProductSwap } from "../../types/inventory";
import { InventorySlideDrawer } from "../shared/InventorySlideDrawer";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";

interface ProductSwapDetailsDrawerProps {
  swap: ProductSwap;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 6 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Grid>
  );
}

export function ProductSwapDetailsDrawer({ swap, onClose }: ProductSwapDetailsDrawerProps) {
  const colors = SWAP_STATUS_COLORS[swap.status];

  return (
    <InventorySlideDrawer
      title={swap.swapNumber}
      subtitle={`${swap.oldProductName} → ${swap.newProductName}`}
      onClose={onClose}
      width={540}
    >
      <WorkspaceSection title="Project Information">
        <Grid container spacing={2}>
          <DetailRow label="Project" value={swap.projectName} />
          {swap.milestone && <DetailRow label="Milestone" value={swap.milestone} />}
          {swap.task && <DetailRow label="Task" value={swap.task} />}
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Swap Information">
        <Grid container spacing={2}>
          <DetailRow label="Date" value={formatDate(swap.date)} />
          <DetailRow label="Created By" value={swap.createdBy} />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Status
            </Typography>
            <InventoryStatusChip
              label={swap.status}
              bg={colors?.bg ?? "#F5F5F5"}
              color={colors?.color ?? "#616161"}
            />
          </Grid>
          <DetailRow label="Old Product" value={swap.oldProductName} />
          <DetailRow label="New Product" value={swap.newProductName} />
          <DetailRow label="Quantity" value={`${swap.quantity} ${swap.unit}`} />
          {swap.reason && <DetailRow label="Reason" value={swap.reason} />}
        </Grid>
      </WorkspaceSection>

      {(swap.quantityReturned != null || swap.availableStock != null) && (
        <WorkspaceSection title="Inventory Impact">
          <Grid container spacing={2}>
            {swap.quantityReturned != null && (
              <DetailRow label="Quantity Returned" value={String(swap.quantityReturned)} />
            )}
            {swap.quantityRequired != null && (
              <DetailRow label="Quantity Required" value={String(swap.quantityRequired)} />
            )}
            {swap.availableStock != null && (
              <DetailRow label="Available Stock" value={String(swap.availableStock)} />
            )}
            {swap.stockShortage != null && swap.stockShortage > 0 && (
              <DetailRow label="Stock Shortage" value={String(swap.stockShortage)} />
            )}
            {swap.costImpact != null && (
              <DetailRow label="Cost Impact" value={formatCurrency(swap.costImpact)} />
            )}
          </Grid>
        </WorkspaceSection>
      )}

      {swap.approvalHistory && swap.approvalHistory.length > 0 && (
        <WorkspaceSection title="Approval History">
          {swap.approvalHistory.map((entry, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                gap: 2,
                py: 1.5,
                borderBottom: i < swap.approvalHistory!.length - 1 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {entry.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.user} · {formatDateTime(entry.timestamp)}
                </Typography>
              </Box>
            </Box>
          ))}
        </WorkspaceSection>
      )}
    </InventorySlideDrawer>
  );
}
