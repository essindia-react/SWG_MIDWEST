import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
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
import { SITE_MATERIAL_REQUEST_STATUS_CONFIG } from "../constants/materialRequestConstants";
import {
  getMaterialRequests,
  seedDemoMaterialRequestIfEmpty,
} from "../lib/materialRequestStore";
import type { MaterialRequest, MaterialRequestStatus } from "../types/materialRequest";
import { MaterialRequestDetailsDrawer } from "./MaterialRequestDetailsDrawer";

const TABLE_COLUMNS = [
  "Request #",
  "Request Date",
  "Project",
  "Requested By",
  "Item",
  "Quantity",
  "Urgency",
  "Status",
] as const;

const STATUS_FILTERS: MaterialRequestStatus[] = [
  "pending",
  "approved",
  "rejected",
  "info_requested",
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function MaterialRequestApprovalView() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | "">("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRequest, setSelectedRequest] = useState<MaterialRequest | null>(null);

  const refresh = useCallback(() => {
    seedDemoMaterialRequestIfEmpty();
    setRequests(getMaterialRequests());
  }, []);

  useEffect(() => {
    refresh();
    const onUpdate = () => refresh();
    window.addEventListener("material-requests-updated", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("material-requests-updated", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  useEffect(() => {
    setPage(0);
  }, [search, statusFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return requests.filter((request) => {
      if (statusFilter && request.status !== statusFilter) return false;
      if (!q) return true;
      return (
        request.requestNumber.toLowerCase().includes(q) ||
        request.projectName.toLowerCase().includes(q) ||
        request.requestedBy.toLowerCase().includes(q) ||
        request.itemName.toLowerCase().includes(q)
      );
    });
  }, [requests, search, statusFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleUpdated = (updated: MaterialRequest) => {
    refresh();
    setSelectedRequest(updated);
  };

  return (
    <Box sx={{ p: 3, height: "100%", overflow: "auto" }}>
      <InventoryPageHeader
        title="Site Material Management"
        subtitle="Crew members raise requests on mobile. Office reviews, approves, and triggers fulfillment."
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search by request #, project, item, or requester..."
        showFilter={false}
        showExport={false}
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {STATUS_FILTERS.map((status) => {
          const config = SITE_MATERIAL_REQUEST_STATUS_CONFIG[status];
          const count = requests.filter((request) => request.status === status).length;
          const isActive = statusFilter === status;
          return (
            <Chip
              key={status}
              label={`${config.label} (${count})`}
              onClick={() => setStatusFilter(isActive ? "" : status)}
              sx={{
                bgcolor: isActive ? config.bg : "background.paper",
                color: isActive ? config.color : "text.secondary",
                fontWeight: 600,
                border: 1,
                borderColor: isActive ? config.color : "divider",
              }}
            />
          );
        })}
      </Box>

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
              {TABLE_COLUMNS.map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600, whiteSpace: "nowrap" }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={TABLE_COLUMNS.length} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No material requests found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((request) => {
                const statusConfig = SITE_MATERIAL_REQUEST_STATUS_CONFIG[request.status];
                return (
                  <TableRow
                    key={request.id}
                    hover
                    sx={{ cursor: "pointer" }}
                    onClick={() => setSelectedRequest(request)}
                  >
                    <TableCell
                      sx={{ fontFamily: "monospace", fontSize: "0.8125rem", fontWeight: 600 }}
                    >
                      {request.requestNumber}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {formatDate(request.requestDateTime)}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>
                        {request.projectName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.projectCode}
                      </Typography>
                    </TableCell>
                    <TableCell>{request.requestedBy}</TableCell>
                    <TableCell sx={{ maxWidth: 180 }}>{request.itemName}</TableCell>
                    <TableCell sx={{ whiteSpace: "nowrap" }}>
                      {request.quantityNeeded} {request.unit}
                    </TableCell>
                    <TableCell>{request.urgency}</TableCell>
                    <TableCell>
                      <InventoryStatusChip
                        label={statusConfig.label}
                        bg={statusConfig.bg}
                        color={statusConfig.color}
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

      {selectedRequest && (
        <MaterialRequestDetailsDrawer
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onUpdated={handleUpdated}
        />
      )}
    </Box>
  );
}
