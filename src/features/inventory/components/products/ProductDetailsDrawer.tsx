import React from "react";
import {
  Box,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import { TRANSACTION_TYPE_COLORS } from "../../constants/inventoryConstants";
import { formatCurrency, formatDate, formatDateTime } from "../../lib/inventoryHelpers";
import { getLedgerEntries } from "../../lib/inventoryStore";
import type { InventoryProduct } from "../../types/inventory";
import { InventorySlideDrawer } from "../shared/InventorySlideDrawer";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";

interface ProductDetailsDrawerProps {
  product: InventoryProduct;
  onClose: () => void;
  onEdit: () => void;
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

export function ProductDetailsDrawer({ product, onClose, onEdit }: ProductDetailsDrawerProps) {
  const transactions = getLedgerEntries()
    .filter((e) => e.productId === product.id)
    .slice(0, 8);

  const isLowStock =
    product.inventoryType === "Stocked" &&
    product.reorderLevel > 0 &&
    product.currentStock <= product.reorderLevel;

  return (
    <InventorySlideDrawer
      title={product.name}
      subtitle={product.sku}
      onClose={onClose}
      width={560}
    >
      <WorkspaceSection title="Basic Information">
        <Grid container spacing={2}>
          <DetailRow label="SKU" value={product.sku} />
          <DetailRow label="Category" value={product.category} />
          <DetailRow label="Unit" value={product.unit} />
          <DetailRow label="Inventory Type" value={product.inventoryType} />
          <DetailRow label="Status" value={product.status} />
          <DetailRow label="Last Updated" value={formatDate(product.updatedAt)} />
          {product.notes && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Notes
              </Typography>
              <Typography variant="body2">{product.notes}</Typography>
            </Grid>
          )}
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Pricing">
        <Grid container spacing={2}>
          <DetailRow label="Unit Cost" value={formatCurrency(product.unitCost)} />
          <DetailRow label="Selling Price" value={formatCurrency(product.sellingPrice)} />
          <DetailRow
            label="Margin"
            value={
              product.sellingPrice > 0
                ? `${(((product.sellingPrice - product.unitCost) / product.sellingPrice) * 100).toFixed(1)}%`
                : "—"
            }
          />
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Inventory Information">
        <Grid container spacing={2}>
          <DetailRow label="Current Stock" value={`${product.currentStock} ${product.unit}`} />
          <DetailRow label="Reorder Level" value={String(product.reorderLevel)} />
          <Grid size={{ xs: 12 }}>
            {isLowStock && (
              <InventoryStatusChip
                label="Low Stock Alert"
                bg="#FFF3E0"
                color="#E65100"
              />
            )}
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Vendor Information">
        <Grid container spacing={2}>
          <DetailRow label="Preferred Vendor" value={product.preferredVendor || "—"} />
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Recent Transactions">
        {transactions.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No transactions recorded for this product.
          </Typography>
        ) : (
          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Qty</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((txn) => {
                  const colors = TRANSACTION_TYPE_COLORS[txn.transactionType];
                  return (
                    <TableRow key={txn.id} hover>
                      <TableCell sx={{ fontSize: "0.8125rem" }}>
                        {formatDateTime(txn.date)}
                      </TableCell>
                      <TableCell>
                        <InventoryStatusChip
                          label={txn.transactionType}
                          bg={colors?.bg ?? "#F5F5F5"}
                          color={colors?.color ?? "#616161"}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          fontWeight: 600,
                          color: txn.quantity >= 0 ? "#2E7D32" : "#C62828",
                        }}
                      >
                        {txn.quantity >= 0 ? "+" : ""}
                        {txn.quantity}
                      </TableCell>
                      <TableCell sx={{ fontSize: "0.8125rem" }}>{txn.referenceNumber}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        )}
      </WorkspaceSection>

      <Divider sx={{ my: 2 }} />
      <Box
        component="button"
        type="button"
        onClick={onEdit}
        sx={{
          border: "none",
          bgcolor: "primary.main",
          color: "#fff",
          px: 3,
          py: 1,
          borderRadius: 1,
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "0.875rem",
          "&:hover": { bgcolor: "primary.dark" },
        }}
      >
        Edit Product
      </Box>
    </InventorySlideDrawer>
  );
}
