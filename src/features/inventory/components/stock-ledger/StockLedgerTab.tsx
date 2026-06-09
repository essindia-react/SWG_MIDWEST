import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { ArrowDownLeft, ArrowUpRight, FileEdit, ScrollText } from "lucide-react";
import { toast } from "sonner";
import { TRANSACTION_TYPE_COLORS } from "../../constants/inventoryConstants";
import {
  calculateLedgerMetrics,
  formatCurrency,
  formatDateTime,
} from "../../lib/inventoryHelpers";
import { getLedgerEntries, getProducts, subscribeInventory } from "../../lib/inventoryStore";
import type { StockLedgerEntry } from "../../types/inventory";
import { InventoryMetricCard } from "../shared/InventoryMetricCard";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";
import { CreateAdjustmentModal } from "./CreateAdjustmentModal";
import { StockLedgerDrawer } from "./StockLedgerDrawer";

export function StockLedgerTab() {
  const [entries, setEntries] = useState(getLedgerEntries);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedEntry, setSelectedEntry] = useState<StockLedgerEntry | null>(null);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [filterProduct, setFilterProduct] = useState("");
  const [filterCreatedBy, setFilterCreatedBy] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  const refresh = useCallback(() => setEntries(getLedgerEntries()), []);

  useEffect(() => {
    return subscribeInventory(refresh);
  }, [refresh]);

  const metrics = useMemo(() => calculateLedgerMetrics(entries), [entries]);
  const products = getProducts();
  const creators = [...new Set(entries.map((e) => e.createdBy))];

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (filterProduct && e.productId !== filterProduct) return false;
      if (filterCreatedBy && e.createdBy !== filterCreatedBy) return false;
      if (filterDateFrom && e.date < filterDateFrom) return false;
      if (filterDateTo && e.date > filterDateTo + "T23:59:59") return false;
      return true;
    });
  }, [entries, filterProduct, filterCreatedBy, filterDateFrom, filterDateTo]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <InventoryPageHeader
        title="Stock Ledger"
        subtitle="Bank statement for all inventory movements"
        showSearch={false}
        showFilter={false}
        onExport={() => toast.success("Export started")}
        onPrimaryAction={() => setShowAdjustment(true)}
        primaryActionLabel="Create Adjustment"
      />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
          p: 2,
          borderRadius: 2,
          border: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          size="small"
          label="Date From"
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small"
          label="Date To"
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small"
          select
          label="Product"
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Products</MenuItem>
          {products.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Created By"
          value={filterCreatedBy}
          onChange={(e) => setFilterCreatedBy(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Users</MenuItem>
          {creators.map((c) => (
            <MenuItem key={c} value={c}>
              {c}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Stock In Today"
            value={String(metrics.stockInToday)}
            icon={<ArrowDownLeft size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Stock Out Today"
            value={String(metrics.stockOutToday)}
            icon={<ArrowUpRight size={16} color="#C62828" />}
            accent="rgba(198, 40, 40, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Adjustments Today"
            value={String(metrics.adjustmentsToday)}
            icon={<FileEdit size={16} color="#E65100" />}
            accent="rgba(230, 81, 0, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Total Transactions"
            value={String(metrics.totalTransactions)}
            icon={<ScrollText size={16} color="#1565C0" />}
            accent="rgba(21, 101, 192, 0.12)"
            highlight
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
                "Transaction ID",
                "Date",
                "Transaction Type",
                "Product",
                "Project",
                "Quantity",
                "Unit Cost",
                "Total Value",
                "Reference Number",
                "Created By",
              ].map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((entry) => {
              const colors = TRANSACTION_TYPE_COLORS[entry.transactionType];
              return (
                <TableRow
                  key={entry.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedEntry(entry)}
                >
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                    {entry.id}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", fontSize: "0.8125rem" }}>
                    {formatDateTime(entry.date)}
                  </TableCell>
                  <TableCell>
                    <InventoryStatusChip
                      label={entry.transactionType}
                      bg={colors?.bg ?? "#F5F5F5"}
                      color={colors?.color ?? "#616161"}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{entry.productName}</TableCell>
                  <TableCell>{entry.projectName ?? "—"}</TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      color: entry.quantity >= 0 ? "#2E7D32" : "#C62828",
                    }}
                  >
                    {entry.quantity >= 0 ? "+" : ""}
                    {entry.quantity}
                  </TableCell>
                  <TableCell>{formatCurrency(entry.unitCost)}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>
                    {formatCurrency(entry.totalValue)}
                  </TableCell>
                  <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                    {entry.referenceNumber}
                  </TableCell>
                  <TableCell>{entry.createdBy}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filtered.length}
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

      {selectedEntry && (
        <StockLedgerDrawer entry={selectedEntry} onClose={() => setSelectedEntry(null)} />
      )}

      <CreateAdjustmentModal open={showAdjustment} onClose={() => setShowAdjustment(false)} />
    </Box>
  );
}
