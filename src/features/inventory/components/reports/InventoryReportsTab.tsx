import React, { useMemo } from "react";
import {
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  calculateLedgerMetrics,
  calculateProductMetrics,
  formatCurrency,
} from "../../lib/inventoryHelpers";
import { getLedgerEntries, getProducts } from "../../lib/inventoryStore";
import { InventoryMetricCard } from "../shared/InventoryMetricCard";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";

export function InventoryReportsTab() {
  const products = getProducts();
  const ledger = getLedgerEntries();
  const productMetrics = useMemo(() => calculateProductMetrics(products), [products]);
  const ledgerMetrics = useMemo(() => calculateLedgerMetrics(ledger), [ledger]);

  const lowStockItems = products.filter(
    (p) =>
      p.inventoryType === "Stocked" &&
      p.reorderLevel > 0 &&
      p.currentStock <= p.reorderLevel
  );

  const topConsumed = useMemo(() => {
    const consumption = new Map<string, { name: string; qty: number; value: number }>();
    ledger
      .filter((e) => e.quantity < 0)
      .forEach((e) => {
        const existing = consumption.get(e.productId) ?? {
          name: e.productName,
          qty: 0,
          value: 0,
        };
        existing.qty += Math.abs(e.quantity);
        existing.value += Math.abs(e.totalValue);
        consumption.set(e.productId, existing);
      });
    return [...consumption.values()].sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [ledger]);

  const stockByCategory = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    products
      .filter((p) => p.inventoryType === "Stocked")
      .forEach((p) => {
        const existing = map.get(p.category) ?? { count: 0, value: 0 };
        existing.count += 1;
        existing.value += p.currentStock * p.unitCost;
        map.set(p.category, existing);
      });
    return [...map.entries()].sort((a, b) => b[1].value - a[1].value);
  }, [products]);

  return (
    <Box>
      <InventoryPageHeader
        title="Inventory Reports"
        subtitle="Analytics and insights across inventory operations"
        showSearch={false}
        showFilter={false}
        onExport={() => toast.success("Report export started")}
      />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Total Inventory Value"
            value={formatCurrency(productMetrics.inventoryValue)}
            icon={<Package size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
            highlight
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Stock In Today"
            value={String(ledgerMetrics.stockInToday)}
            icon={<TrendingUp size={16} color="#1565C0" />}
            accent="rgba(21, 101, 192, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Stock Out Today"
            value={String(ledgerMetrics.stockOutToday)}
            icon={<TrendingDown size={16} color="#C62828" />}
            accent="rgba(198, 40, 40, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Low Stock Alerts"
            value={String(lowStockItems.length)}
            icon={<AlertTriangle size={16} color="#E65100" />}
            accent="rgba(230, 81, 0, 0.12)"
            highlight={lowStockItems.length > 0}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, mb: 2 }}>
            Low Stock Items
          </Typography>
          <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["Product", "Current Stock", "Reorder Level", "Status"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600 }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {lowStockItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                      <Typography color="text.secondary">No low stock alerts</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStockItems.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                      <TableCell>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>{item.reorderLevel}</TableCell>
                      <TableCell>
                        <InventoryStatusChip
                          label="Low Stock"
                          bg="#FFF3E0"
                          color="#E65100"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, mb: 2 }}>
            Top Consumed Products
          </Typography>
          <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["Product", "Qty Consumed", "Value"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600 }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {topConsumed.map((item) => (
                  <TableRow key={item.name} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{item.name}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{formatCurrency(item.value)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Typography sx={{ fontSize: "1rem", fontWeight: 700, mb: 2 }}>
            Stock Value by Category
          </Typography>
          <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  {["Category", "Products", "Total Value", "% of Inventory"].map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600 }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {stockByCategory.map(([category, data]) => (
                  <TableRow key={category} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{category}</TableCell>
                    <TableCell>{data.count}</TableCell>
                    <TableCell>{formatCurrency(data.value)}</TableCell>
                    <TableCell>
                      {productMetrics.inventoryValue > 0
                        ? `${((data.value / productMetrics.inventoryValue) * 100).toFixed(1)}%`
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}
