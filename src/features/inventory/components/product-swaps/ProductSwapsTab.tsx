import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowLeftRight, CheckCircle, Clock, Eye, TrendingDown } from "lucide-react";
import { toast } from "sonner";
import { SWAP_STATUS_COLORS } from "../../constants/inventoryConstants";
import { formatCurrency, formatDate } from "../../lib/inventoryHelpers";
import { getProductSwaps, subscribeInventory } from "../../lib/inventoryStore";
import type { ProductSwap } from "../../types/inventory";
import { InventoryMetricCard } from "../shared/InventoryMetricCard";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";
import { CreateProductSwapWizard } from "./CreateProductSwapWizard";
import { ProductSwapDetailsDrawer } from "./ProductSwapDetailsDrawer";

export function ProductSwapsTab() {
  const [swaps, setSwaps] = useState(getProductSwaps);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedSwap, setSelectedSwap] = useState<ProductSwap | null>(null);
  const [showWizard, setShowWizard] = useState(false);

  const refresh = useCallback(() => setSwaps(getProductSwaps()), []);

  useEffect(() => {
    return subscribeInventory(refresh);
  }, [refresh]);

  const metrics = useMemo(() => {
    const open = swaps.filter((s) => s.status === "Draft" || s.status === "Pending").length;
    const completed = swaps.filter((s) => s.status === "Completed").length;
    const pendingApproval = swaps.filter((s) => s.status === "Pending").length;
    const impact = swaps
      .filter((s) => s.status === "Completed")
      .reduce((sum, s) => sum + (s.costImpact ?? 0), 0);
    return { open, completed, pendingApproval, impact };
  }, [swaps]);

  const paginated = swaps.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <InventoryPageHeader
        title="Product Swaps"
        subtitle="Replace allocated materials during project execution"
        showSearch={false}
        showFilter={false}
        onExport={() => toast.success("Export started")}
        onPrimaryAction={() => setShowWizard(true)}
        primaryActionLabel="New Swap"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Open Swaps"
            value={String(metrics.open)}
            icon={<ArrowLeftRight size={16} color="#1565C0" />}
            accent="rgba(21, 101, 192, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Completed Swaps"
            value={String(metrics.completed)}
            icon={<CheckCircle size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Pending Approval"
            value={String(metrics.pendingApproval)}
            icon={<Clock size={16} color="#F57F17" />}
            accent="rgba(245, 127, 23, 0.12)"
            highlight={metrics.pendingApproval > 0}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Inventory Impact"
            value={formatCurrency(metrics.impact)}
            icon={<TrendingDown size={16} color="#7C3AED" />}
            accent="rgba(124, 58, 237, 0.12)"
          />
        </Grid>
      </Grid>

      <TableContainer
        sx={{ border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {[
                "Swap Number",
                "Date",
                "Project",
                "Old Product",
                "New Product",
                "Quantity",
                "Status",
                "Created By",
                "Actions",
              ].map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((swap) => {
              const colors = SWAP_STATUS_COLORS[swap.status];
              return (
                <TableRow
                  key={swap.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedSwap(swap)}
                >
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                    {swap.swapNumber}
                  </TableCell>
                  <TableCell>{formatDate(swap.date)}</TableCell>
                  <TableCell>{swap.projectName}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{swap.oldProductName}</TableCell>
                  <TableCell sx={{ fontSize: "0.8125rem" }}>{swap.newProductName}</TableCell>
                  <TableCell>
                    {swap.quantity} {swap.unit}
                  </TableCell>
                  <TableCell>
                    <InventoryStatusChip
                      label={swap.status}
                      bg={colors?.bg ?? "#F5F5F5"}
                      color={colors?.color ?? "#616161"}
                    />
                  </TableCell>
                  <TableCell>{swap.createdBy}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => setSelectedSwap(swap)}>
                      <Eye size={16} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={swaps.length}
          page={page}
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </TableContainer>

      {selectedSwap && (
        <ProductSwapDetailsDrawer swap={selectedSwap} onClose={() => setSelectedSwap(null)} />
      )}

      <CreateProductSwapWizard open={showWizard} onClose={() => setShowWizard(false)} />
    </Box>
  );
}
