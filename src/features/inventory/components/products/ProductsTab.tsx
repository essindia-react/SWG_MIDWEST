import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { AlertTriangle, DollarSign, Eye, MoreHorizontal, Package, Pencil, Star } from "lucide-react";
import { toast } from "sonner";
import { calculateProductMetrics, formatCurrency } from "../../lib/inventoryHelpers";
import { getProducts, subscribeInventory } from "../../lib/inventoryStore";
import type { InventoryProduct } from "../../types/inventory";
import { InventoryMetricCard } from "../shared/InventoryMetricCard";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";
import { AddProductModal } from "./AddProductModal";
import { ProductDetailsDrawer } from "./ProductDetailsDrawer";

export function ProductsTab() {
  const [products, setProducts] = useState(getProducts);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);
  const [editProduct, setEditProduct] = useState<InventoryProduct | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuProduct, setMenuProduct] = useState<InventoryProduct | null>(null);

  const refresh = useCallback(() => setProducts(getProducts()), []);

  useEffect(() => {
    return subscribeInventory(refresh);
  }, [refresh]);

  const metrics = useMemo(() => calculateProductMetrics(products), [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.preferredVendor.toLowerCase().includes(q)
    );
  }, [products, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, product: InventoryProduct) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuProduct(product);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuProduct(null);
  };

  const handleView = (product: InventoryProduct) => {
    setSelectedProduct(product);
    handleMenuClose();
  };

  const handleEdit = (product: InventoryProduct) => {
    setEditProduct(product);
    setShowAddModal(true);
    setSelectedProduct(null);
    handleMenuClose();
  };

  return (
    <Box>
      <InventoryPageHeader
        title="Products"
        subtitle="Manage all inventory products and materials"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search products..."
        onFilter={() => toast.info("Filter panel — coming soon")}
        onExport={() => toast.success("Export started")}
        onPrimaryAction={() => {
          setEditProduct(null);
          setShowAddModal(true);
        }}
        primaryActionLabel="Add Product"
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Total Products"
            value={String(metrics.totalProducts)}
            icon={<Package size={16} color="#2E7D32" />}
            accent="rgba(46, 125, 50, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Inventory Value"
            value={formatCurrency(metrics.inventoryValue)}
            icon={<DollarSign size={16} color="#1565C0" />}
            accent="rgba(21, 101, 192, 0.12)"
            highlight
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Stocked Products"
            value={String(metrics.stockedProducts)}
            icon={<Package size={16} color="#7C3AED" />}
            accent="rgba(124, 58, 237, 0.12)"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <InventoryMetricCard
            label="Special Order Products"
            value={String(metrics.specialOrderProducts)}
            icon={<Star size={16} color="#D97706" />}
            accent="rgba(217, 119, 6, 0.12)"
          />
        </Grid>
      </Grid>

      <TableContainer
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {[
                "SKU",
                "Product Name",
                "Category",
                "Unit",
                "Unit Cost",
                "Selling Price",
                "Inventory Type",
                "Current Stock",
                "Preferred Vendor",
                "Status",
                "Actions",
              ].map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No products found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((product) => {
                const isLowStock =
                  product.inventoryType === "Stocked" &&
                  product.reorderLevel > 0 &&
                  product.currentStock <= product.reorderLevel;

                return (
                  <TableRow
                    key={product.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSelectedProduct(product)}
                  >
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                      {product.sku}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500, maxWidth: 200 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {product.name}
                        {isLowStock && <AlertTriangle size={14} color="#E65100" />}
                      </Box>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>{product.unit}</TableCell>
                    <TableCell>{formatCurrency(product.unitCost)}</TableCell>
                    <TableCell>{formatCurrency(product.sellingPrice)}</TableCell>
                    <TableCell>
                      <InventoryStatusChip
                        label={product.inventoryType}
                        bg={
                          product.inventoryType === "Stocked"
                            ? "#E8F5E9"
                            : product.inventoryType === "Special Order"
                              ? "#FFF3E0"
                              : "#F5F5F5"
                        }
                        color={
                          product.inventoryType === "Stocked"
                            ? "#2E7D32"
                            : product.inventoryType === "Special Order"
                              ? "#E65100"
                              : "#616161"
                        }
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>
                      {product.currentStock} {product.unit}
                    </TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>
                      {product.preferredVendor || "—"}
                    </TableCell>
                    <TableCell>
                      <InventoryStatusChip
                        label={product.status}
                        bg={product.status === "Active" ? "#E8F5E9" : "#F5F5F5"}
                        color={product.status === "Active" ? "#2E7D32" : "#616161"}
                      />
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <IconButton size="small" onClick={(e) => handleMenuOpen(e, product)}>
                        <MoreHorizontal size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
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

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => menuProduct && handleView(menuProduct)}>
          <Eye size={14} style={{ marginRight: 8 }} /> View
        </MenuItem>
        <MenuItem onClick={() => menuProduct && handleEdit(menuProduct)}>
          <Pencil size={14} style={{ marginRight: 8 }} /> Edit
        </MenuItem>
      </Menu>

      {selectedProduct && (
        <ProductDetailsDrawer
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onEdit={() => handleEdit(selectedProduct)}
        />
      )}

      <AddProductModal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditProduct(null);
        }}
        editProduct={editProduct}
      />
    </Box>
  );
}
