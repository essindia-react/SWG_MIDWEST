import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { InventoryPageHeader } from "../../inventory/components/shared/InventoryPageHeader";
import { InventoryStatusChip } from "../../inventory/components/shared/InventoryStatusChip";
import { PO_STATUS_COLORS } from "../constants/purchaseRequisitionConstants";
import {
  getPurchaseRequisitions,
  subscribePurchaseRequisitions,
} from "../lib/purchaseRequisitionStore";
import { formatDate } from "../lib/purchaseRequisitionHelpers";

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

export function PurchaseOrderListView() {
  const [requisitions, setRequisitions] = useState(getPurchaseRequisitions);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const refresh = useCallback(() => setRequisitions(getPurchaseRequisitions()), []);

  useEffect(() => {
    return subscribePurchaseRequisitions(refresh);
  }, [refresh]);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return requisitions;
    return requisitions.filter((pr) => {
      const matchesProject = pr.linkedProjectName.toLowerCase().includes(q);
      const matchesVendor = pr.vendorName.toLowerCase().includes(q);
      const matchesPo = pr.poNumber.toLowerCase().includes(q);
      return matchesProject || matchesVendor || matchesPo;
    });
  }, [requisitions, search]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <InventoryPageHeader
        title="Purchase Orders"
        subtitle="Generated purchase requisitions listed as purchase orders"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by PO #, project, or vendor..."
        showFilter={false}
        showExport={false}
      />

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
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={DATA_COLUMNS.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No purchase orders found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((pr) => {
                const statusColors = PO_STATUS_COLORS[pr.status];
                return (
                  <TableRow key={pr.id} hover>
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
    </Box>
  );
}
