import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  IconButton,
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
import { Eye } from "lucide-react";
import { toast } from "sonner";
import { DUMMY_PROJECTS } from "../../data/dummyInventoryData";
import { MATERIAL_REQUEST_STATUS_COLORS } from "../../constants/inventoryConstants";
import { formatDate } from "../../lib/inventoryHelpers";
import { getMaterialRequests, subscribeInventory } from "../../lib/inventoryStore";
import type { InventoryMaterialRequest, MaterialRequestStatus } from "../../types/inventory";
import { InventoryPageHeader } from "../shared/InventoryPageHeader";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";
import { MaterialRequestDetailsView } from "./MaterialRequestDetailsView";

const STATUS_FILTERS: MaterialRequestStatus[] = [
  "Pending",
  "Approved",
  "Partially Fulfilled",
  "Fulfilled",
  "Rejected",
];

export function MaterialRequestsTab() {
  const [requests, setRequests] = useState(getMaterialRequests);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<MaterialRequestStatus | "">("");
  const [projectFilter, setProjectFilter] = useState("");
  const [requesterFilter, setRequesterFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const refresh = useCallback(() => setRequests(getMaterialRequests()), []);

  useEffect(() => {
    return subscribeInventory(refresh);
  }, [refresh]);

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const requesters = [...new Set(requests.map((r) => r.requestedBy))];

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter && r.status !== statusFilter) return false;
      if (projectFilter && r.projectId !== projectFilter) return false;
      if (requesterFilter && r.requestedBy !== requesterFilter) return false;
      if (dateFilter && r.requestDate !== dateFilter) return false;
      return true;
    });
  }, [requests, statusFilter, projectFilter, requesterFilter, dateFilter]);

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (selected) {
    return (
      <MaterialRequestDetailsView
        request={selected}
        onBack={() => setSelectedId(null)}
        onUpdated={refresh}
      />
    );
  }

  return (
    <Box>
      <InventoryPageHeader
        title="Material Requests"
        subtitle="Track inventory requested for projects"
        showSearch={false}
        showFilter={false}
        onExport={() => toast.success("Export started")}
        onPrimaryAction={() => toast.info("New request form — coming soon")}
        primaryActionLabel="New Request"
      />

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {STATUS_FILTERS.map((status) => {
          const colors = MATERIAL_REQUEST_STATUS_COLORS[status];
          const count = requests.filter((r) => r.status === status).length;
          const isActive = statusFilter === status;
          return (
            <Chip
              key={status}
              label={`${status} (${count})`}
              onClick={() => setStatusFilter(isActive ? "" : status)}
              sx={{
                bgcolor: isActive ? colors.bg : "background.paper",
                color: isActive ? colors.color : "text.secondary",
                fontWeight: 600,
                border: 1,
                borderColor: isActive ? colors.color : "divider",
              }}
            />
          );
        })}
      </Box>

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
          select
          label="Project"
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All Projects</MenuItem>
          {DUMMY_PROJECTS.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          select
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MaterialRequestStatus | "")}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All Statuses</MenuItem>
          {STATUS_FILTERS.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          label="Request Date"
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 150 }}
        />
        <TextField
          size="small"
          select
          label="Requester"
          value={requesterFilter}
          onChange={(e) => setRequesterFilter(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Requesters</MenuItem>
          {requesters.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer
        sx={{ border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "grey.50" }}>
              {[
                "Request No",
                "Request Date",
                "Project",
                "Requested By",
                "Items Count",
                "Status",
                "Actions",
              ].map((col) => (
                <TableCell key={col} sx={{ fontWeight: 600 }}>
                  {col}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((request) => {
              const colors = MATERIAL_REQUEST_STATUS_COLORS[request.status];
              return (
                <TableRow
                  key={request.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => setSelectedId(request.id)}
                >
                  <TableCell sx={{ fontFamily: "monospace", fontWeight: 500 }}>
                    {request.requestNo}
                  </TableCell>
                  <TableCell>{formatDate(request.requestDate)}</TableCell>
                  <TableCell>{request.projectName}</TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell align="center">{request.items.length}</TableCell>
                  <TableCell>
                    <InventoryStatusChip
                      label={request.status}
                      bg={colors?.bg ?? "#F5F5F5"}
                      color={colors?.color ?? "#616161"}
                    />
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <IconButton size="small" onClick={() => setSelectedId(request.id)}>
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
