import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Package, XCircle } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceSection } from "../../leads/components/workspace/WorkspaceSection";
import { InventorySlideDrawer } from "../../inventory/components/shared/InventorySlideDrawer";
import { InventoryStatusChip } from "../../inventory/components/shared/InventoryStatusChip";
import {
  APPROVAL_DECISIONS,
  FULFILLMENT_METHODS,
  SITE_MATERIAL_REQUEST_STATUS_CONFIG,
} from "../constants/materialRequestConstants";
import { processMaterialRequestDecision } from "../lib/materialRequestStore";
import type {
  ApprovalDecision,
  MaterialRequest,
} from "../types/materialRequest";

interface MaterialRequestDetailsDrawerProps {
  request: MaterialRequest;
  onClose: () => void;
  onUpdated: (updated: MaterialRequest) => void;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function RequestDetailRow({ label, value }: { label: string; value: string }) {
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

export function MaterialRequestDetailsDrawer({
  request,
  onClose,
  onUpdated,
}: MaterialRequestDetailsDrawerProps) {
  const [approvalDecision, setApprovalDecision] = useState<
    ApprovalDecision | ""
  >("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("");
  const [approvedQuantity, setApprovedQuantity] = useState("");
  const [notesToCrew, setNotesToCrew] = useState("");

  const statusConfig = SITE_MATERIAL_REQUEST_STATUS_CONFIG[request.status];
  const canDecide =
    request.status === "pending" || request.status === "info_requested";

  useEffect(() => {
    setApprovalDecision(request.approvalDecision ?? "");
    setFulfillmentMethod(request.fulfillmentMethod ?? "");
    setApprovedQuantity(
      request.approvedQuantity != null
        ? String(request.approvedQuantity)
        : String(request.quantityNeeded),
    );
    setNotesToCrew(request.notesToCrew ?? "");
  }, [request]);

  const handleApprove = () => {
    if (!approvalDecision) {
      toast.error("Select an approval decision");
      return;
    }
    if (approvalDecision === "Approve" && !fulfillmentMethod) {
      toast.error("Select a fulfillment method");
      return;
    }

    const status =
      approvalDecision === "Approve"
        ? "approved"
        : approvalDecision === "Reject"
          ? "rejected"
          : "info_requested";

    const updated = processMaterialRequestDecision(request.id, {
      approvalDecision,
      fulfillmentMethod:
        approvalDecision === "Approve"
          ? (fulfillmentMethod as MaterialRequest["fulfillmentMethod"])
          : undefined,
      approvedQuantity:
        approvalDecision === "Approve"
          ? Number(approvedQuantity) || request.quantityNeeded
          : undefined,
      notesToCrew,
      status,
    });

    if (!updated) return;

    toast.success(
      approvalDecision === "Approve"
        ? "Request approved — fulfillment flow triggered"
        : approvalDecision === "Reject"
          ? "Request rejected — crew notified"
          : "More info requested — crew notified",
    );
    onUpdated(updated);
  };

  return (
    <InventorySlideDrawer
      title={request.requestNumber}
      subtitle={`${request.projectCode} — ${request.projectName}`}
      onClose={onClose}
      width={560}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <InventoryStatusChip
          label={statusConfig.label}
          bg={statusConfig.bg}
          color={statusConfig.color}
        />
      </Box>

      <WorkspaceSection title="Request Details">
        <Grid container spacing={2}>
          <RequestDetailRow label="Request #" value={request.requestNumber} />
          <RequestDetailRow
            label="Project"
            value={`${request.projectCode} — ${request.projectName}`}
          />
          <RequestDetailRow label="Requested By" value={request.requestedBy} />
          <RequestDetailRow
            label="Request Date & Time"
            value={formatDateTime(request.requestDateTime)}
          />
          <RequestDetailRow label="Item Name" value={request.itemName} />
          <RequestDetailRow
            label="Quantity Needed"
            value={`${request.quantityNeeded} ${request.unit}`}
          />
          <RequestDetailRow label="Reason" value={request.reason} />
          <RequestDetailRow label="Urgency" value={request.urgency} />
          {request.linkedPONumber && (
            <RequestDetailRow label="Linked PO #" value={request.linkedPONumber} />
          )}
          {request.fulfillmentMethod && (
            <RequestDetailRow label="Fulfillment" value={request.fulfillmentMethod} />
          )}
          <RequestDetailRow
            label="Photo"
            value={request.photoAttached ? "Attached" : "None"}
          />
          <Grid size={{ xs: 12 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              Notes
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {request.notes || "—"}
            </Typography>
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Manager Approval">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              select
              label="Approval Decision"
              value={approvalDecision}
              onChange={(e) =>
                setApprovalDecision(e.target.value as ApprovalDecision)
              }
              fullWidth
              size="small"
              disabled={!canDecide}
            >
              {APPROVAL_DECISIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {approvalDecision === "Approve" && (
            <>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  label="Fulfillment Method"
                  value={fulfillmentMethod}
                  onChange={(e) => setFulfillmentMethod(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!canDecide}
                >
                  {FULFILLMENT_METHODS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Approved Quantity"
                  type="number"
                  value={approvedQuantity}
                  onChange={(e) => setApprovedQuantity(e.target.value)}
                  fullWidth
                  size="small"
                  disabled={!canDecide}
                />
              </Grid>
            </>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              label="Notes to Crew"
              value={notesToCrew}
              onChange={(e) => setNotesToCrew(e.target.value)}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="Message sent back to crew member"
              disabled={!canDecide}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            {canDecide ? (
              <Button
                variant="contained"
                startIcon={<CheckCircle size={16} />}
                onClick={handleApprove}
              >
                Submit Decision
              </Button>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "text.secondary",
                }}
              >
                {request.status === "approved" ? (
                  <CheckCircle
                    size={16}
                    style={{ color: "var(--brand-green)" }}
                  />
                ) : (
                  <XCircle size={16} style={{ color: "var(--status-red)" }} />
                )}
                <Typography variant="body2">
                  Decision recorded — {statusConfig.label}
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </WorkspaceSection>
    </InventorySlideDrawer>
  );
}
