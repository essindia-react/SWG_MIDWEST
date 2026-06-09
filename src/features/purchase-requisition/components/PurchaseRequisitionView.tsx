import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
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
import { Eye, Pencil } from "lucide-react";
import { InventoryPageHeader } from "../../inventory/components/shared/InventoryPageHeader";
import { InventoryStatusChip } from "../../inventory/components/shared/InventoryStatusChip";
import { PO_STATUS_COLORS } from "../constants/purchaseRequisitionConstants";
import {
  getPurchaseRequisitions,
  subscribePurchaseRequisitions,
} from "../lib/purchaseRequisitionStore";
import { formatDate } from "../lib/purchaseRequisitionHelpers";
import type { PurchaseRequisition } from "../types/purchaseRequisition";
import { AddPurchaseRequisitionModal } from "./AddPurchaseRequisitionModal";
import { PurchaseRequisitionDetailsDrawer } from "./PurchaseRequisitionDetailsDrawer";

const DATA_COLUMNS = [
  "PO #",
  "PO Date",
  "PO Type",
  "Linked Project",
  "Linked Material Request #",
  "Vendor Name",
  "Vendor Contact",
  "Vendor Email",
  "Delivery Address",
  "Required Delivery Date",
  "Payment Terms",
  "Notes to Vendor",
  "Status",
] as const;

const stickyActionHeadSx = {
  position: "sticky",
  right: 0,
  zIndex: 4,
  fontWeight: 600,
  whiteSpace: "nowrap",
  bgcolor: "grey.50",
  borderLeft: 1,
  borderColor: "divider",
  boxShadow: "-4px 0 8px -4px rgba(0,0,0,0.08)",
  minWidth: 96,
};

const stickyActionCellSx = {
  position: "sticky",
  right: 0,
  zIndex: 1,
  bgcolor: "background.paper",
  borderLeft: 1,
  borderColor: "divider",
  boxShadow: "-4px 0 8px -4px rgba(0,0,0,0.08)",
  minWidth: 96,
  ".MuiTableRow-hover:hover &": {
    bgcolor: "action.hover",
  },
};

interface DrawerState {
  requisition: PurchaseRequisition;
  mode: "view" | "edit";
}

export function PurchaseRequisitionView() {
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>(getPurchaseRequisitions);
  const [search, setSearch] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [drawerState, setDrawerState] = useState<DrawerState | null>(null);

  const refresh = useCallback(() => setRequisitions(getPurchaseRequisitions()), []);

  useEffect(() => {
    return subscribePurchaseRequisitions(refresh);
  }, [refresh]);

  useEffect(() => {
    setPage(0);
  }, [search, filterDateFrom, filterDateTo]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requisitions.filter((pr) => {
      if (q) {
        const matchesProject = pr.linkedProjectName.toLowerCase().includes(q);
        const matchesVendor = pr.vendorName.toLowerCase().includes(q);
        if (!matchesProject && !matchesVendor) return false;
      }
      if (filterDateFrom && pr.poDate < filterDateFrom) return false;
      if (filterDateTo && pr.poDate > filterDateTo) return false;
      return true;
    });
  }, [requisitions, search, filterDateFrom, filterDateTo]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const clearDateFilters = () => {
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters = Boolean(filterDateFrom || filterDateTo);

  const openDrawer = (requisition: PurchaseRequisition, mode: "view" | "edit") => {
    setDrawerState({ requisition, mode });
  };

  const handleSaved = (updated: PurchaseRequisition) => {
    setDrawerState({ requisition: updated, mode: "view" });
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <InventoryPageHeader
        title="Purchase Requisitions"
        subtitle="Create and manage purchase orders for materials, equipment, and vendors"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by project or vendor..."
        onFilter={() => setShowFilters((value) => !value)}
        showExport={false}
        onPrimaryAction={() => setShowAddModal(true)}
        primaryActionLabel="Add PR"
      />

      {(showFilters || hasActiveFilters) && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 2,
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            label="PO Date From"
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          <TextField
            size="small"
            label="PO Date To"
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 160 }}
          />
          {hasActiveFilters && (
            <Button size="small" onClick={clearDateFilters} sx={{ color: "text.secondary" }}>
              Clear dates
            </Button>
          )}
        </Box>
      )}

      <TableContainer
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "background.paper",
          overflowX: "auto",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {DATA_COLUMNS.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
              <TableCell sx={stickyActionHeadSx}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={DATA_COLUMNS.length + 1} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No purchase requisitions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((pr) => {
                const statusColors = PO_STATUS_COLORS[pr.status];
                return (
                  <TableRow
                    key={pr.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => openDrawer(pr, "view")}
                  >
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 600 }}>
                      {pr.poNumber}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDate(pr.poDate)}</TableCell>
                    <TableCell>{pr.poType}</TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>{pr.linkedProjectName}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: "0.8125rem" }}>
                      {pr.linkedMaterialRequestNumber || "—"}
                    </TableCell>
                    <TableCell>{pr.vendorName}</TableCell>
                    <TableCell>{pr.vendorContact}</TableCell>
                    <TableCell sx={{ fontSize: "0.8125rem" }}>{pr.vendorEmail}</TableCell>
                    <TableCell>{pr.deliveryAddress}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(pr.requiredDeliveryDate)}
                    </TableCell>
                    <TableCell>{pr.paymentTerms}</TableCell>
                    <TableCell sx={{ maxWidth: 200, fontSize: "0.8125rem" }}>
                      {pr.notesToVendor || "—"}
                    </TableCell>
                    <TableCell>
                      <InventoryStatusChip
                        label={pr.status}
                        bg={statusColors.bg}
                        color={statusColors.color}
                      />
                    </TableCell>
                    <TableCell sx={stickyActionCellSx} onClick={(e) => e.stopPropagation()}>
                      <Box sx={{ display: "flex", justifyContent: "center", gap: 0.25 }}>
                        <IconButton
                          size="small"
                          aria-label="View purchase requisition"
                          onClick={() => openDrawer(pr, "view")}
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label="Edit purchase requisition"
                          onClick={() => openDrawer(pr, "edit")}
                        >
                          <Pencil size={16} />
                        </IconButton>
                      </Box>
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

      {drawerState && (
        <PurchaseRequisitionDetailsDrawer
          requisition={drawerState.requisition}
          mode={drawerState.mode}
          onClose={() => setDrawerState(null)}
          onModeChange={(mode) =>
            setDrawerState((prev) => (prev ? { ...prev, mode } : null))
          }
          onSaved={handleSaved}
        />
      )}

      <AddPurchaseRequisitionModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </Box>
  );
}
