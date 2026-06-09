import React from "react";
import {
  Box,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ArrowLeft, CheckCircle, Package, XCircle } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import { MATERIAL_REQUEST_STATUS_COLORS } from "../../constants/inventoryConstants";
import { formatDate, formatDateTime } from "../../lib/inventoryHelpers";
import { updateMaterialRequest } from "../../lib/inventoryStore";
import type { InventoryMaterialRequest } from "../../types/inventory";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";

interface MaterialRequestDetailsViewProps {
  request: InventoryMaterialRequest;
  onBack: () => void;
  onUpdated: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 12, sm: 4 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Grid>
  );
}

export function MaterialRequestDetailsView({
  request,
  onBack,
  onUpdated,
}: MaterialRequestDetailsViewProps) {
  const statusColors = MATERIAL_REQUEST_STATUS_COLORS[request.status];

  const handleApprove = () => {
    updateMaterialRequest(request.id, {
      status: "Approved",
      approvedBy: "Maria S.",
      approvedAt: new Date().toISOString(),
    });
    toast.success("Request approved");
    onUpdated();
  };

  const handleReject = () => {
    updateMaterialRequest(request.id, {
      status: "Rejected",
      approvedBy: "Maria S.",
      approvedAt: new Date().toISOString(),
      rejectionReason: "Rejected by inventory manager",
    });
    toast.success("Request rejected");
    onUpdated();
  };

  const handleFulfill = () => {
    updateMaterialRequest(request.id, {
      status: "Fulfilled",
      items: request.items.map((item) => ({
        ...item,
        allocatedQty: item.requestedQty,
        status: "Fulfilled" as const,
      })),
    });
    toast.success("Request fulfilled — stock out transactions created");
    onUpdated();
  };

  const canAct = request.status === "Pending" || request.status === "Approved";

  return (
    <Box>
      <Button
        startIcon={<ArrowLeft size={16} />}
        onClick={onBack}
        sx={{ mb: 2, color: "text.secondary" }}
      >
        Back to Material Requests
      </Button>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {request.requestNo}
        </Typography>
        <InventoryStatusChip
          label={request.status}
          bg={statusColors?.bg ?? "#F5F5F5"}
          color={statusColors?.color ?? "#616161"}
        />
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <WorkspaceSection title="Request Information">
            <Grid container spacing={2}>
              <DetailRow label="Request No" value={request.requestNo} />
              <DetailRow label="Request Date" value={formatDate(request.requestDate)} />
              <DetailRow label="Requested By" value={request.requestedBy} />
              <DetailRow label="Items Count" value={String(request.items.length)} />
            </Grid>
          </WorkspaceSection>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <WorkspaceSection title="Project Information">
            <Grid container spacing={2}>
              <DetailRow label="Project" value={request.projectName} />
              <DetailRow label="Project ID" value={request.projectId} />
            </Grid>
          </WorkspaceSection>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <WorkspaceSection title="Approval Information">
            <Grid container spacing={2}>
              <DetailRow label="Approved By" value={request.approvedBy ?? "—"} />
              <DetailRow
                label="Approved At"
                value={request.approvedAt ? formatDateTime(request.approvedAt) : "—"}
              />
              {request.rejectionReason && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="error" display="block">
                    Rejection Reason
                  </Typography>
                  <Typography variant="body2" color="error">
                    {request.rejectionReason}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </WorkspaceSection>
        </Grid>
      </Grid>

      <WorkspaceSection title="Requested Items">
        <TableContainer sx={{ border: 1, borderColor: "divider", borderRadius: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["Product", "Requested Qty", "Available Qty", "Allocated Qty", "Status"].map(
                  (col) => (
                    <TableCell key={col} sx={{ fontWeight: 600 }}>
                      {col}
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {request.items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.productName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.sku}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.requestedQty} {item.unit}
                  </TableCell>
                  <TableCell>
                    {item.availableQty} {item.unit}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    {item.allocatedQty} {item.unit}
                  </TableCell>
                  <TableCell>
                    <InventoryStatusChip
                      label={item.status}
                      bg={
                        item.status === "Fulfilled"
                          ? "#E8F5E9"
                          : item.status === "Rejected"
                            ? "#FFEBEE"
                            : "#FFF8E1"
                      }
                      color={
                        item.status === "Fulfilled"
                          ? "#2E7D32"
                          : item.status === "Rejected"
                            ? "#C62828"
                            : "#F57F17"
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </WorkspaceSection>

      {canAct && (
        <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
          <Button
            variant="contained"
            startIcon={<CheckCircle size={16} />}
            onClick={handleApprove}
            disabled={request.status !== "Pending"}
          >
            Approve Request
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<XCircle size={16} />}
            onClick={handleReject}
            disabled={request.status !== "Pending"}
          >
            Reject Request
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<Package size={16} />}
            onClick={handleFulfill}
            disabled={request.status === "Pending"}
            sx={{ bgcolor: "#1565C0", "&:hover": { bgcolor: "#0D47A1" } }}
          >
            Fulfill Request
          </Button>
        </Box>
      )}
    </Box>
  );
}
