import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { CheckCircle, Clock, ExternalLink, Package, XCircle } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceSection } from "../../leads/components/workspace/WorkspaceSection";
import {
  APPROVAL_DECISIONS,
  FULFILLMENT_METHODS,
} from "../constants/materialRequestConstants";
import {
  getMaterialRequests,
  seedDemoMaterialRequestIfEmpty,
  updateMaterialRequest,
} from "../lib/materialRequestStore";
import type { ApprovalDecision, MaterialRequest } from "../types/materialRequest";
import { ROUTES } from "../../../routes/paths";

const STATUS_CONFIG: Record<
  MaterialRequest["status"],
  { label: string; color: "warning" | "success" | "error" | "info" }
> = {
  pending: { label: "Pending Review", color: "warning" },
  approved: { label: "Approved", color: "success" },
  rejected: { label: "Rejected", color: "error" },
  info_requested: { label: "More Info Requested", color: "info" },
};

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

export function MaterialRequestApprovalView() {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [approvalDecision, setApprovalDecision] = useState<ApprovalDecision | "">("");
  const [fulfillmentMethod, setFulfillmentMethod] = useState("");
  const [approvedQuantity, setApprovedQuantity] = useState("");
  const [notesToCrew, setNotesToCrew] = useState("");

  const refresh = useCallback(() => {
    seedDemoMaterialRequestIfEmpty();
    const all = getMaterialRequests();
    setRequests(all);
    setSelectedId((prev) => {
      if (prev && all.some((request) => request.id === prev)) return prev;
      return all[0]?.id ?? null;
    });
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

  const selected = requests.find((request) => request.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected) {
      setApprovalDecision("");
      setFulfillmentMethod("");
      setApprovedQuantity("");
      setNotesToCrew("");
      return;
    }
    setApprovalDecision(selected.approvalDecision ?? "");
    setFulfillmentMethod(selected.fulfillmentMethod ?? "");
    setApprovedQuantity(
      selected.approvedQuantity != null
        ? String(selected.approvedQuantity)
        : String(selected.quantityNeeded)
    );
    setNotesToCrew(selected.notesToCrew ?? "");
  }, [selected]);

  const handleApprove = () => {
    if (!selected || !approvalDecision) {
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

    updateMaterialRequest(selected.id, {
      approvalDecision,
      fulfillmentMethod: approvalDecision === "Approve" ? (fulfillmentMethod as MaterialRequest["fulfillmentMethod"]) : undefined,
      approvedQuantity:
        approvalDecision === "Approve"
          ? Number(approvedQuantity) || selected.quantityNeeded
          : undefined,
      notesToCrew,
      status,
    });

    toast.success(
      approvalDecision === "Approve"
        ? "Request approved — fulfillment flow triggered"
        : approvalDecision === "Reject"
          ? "Request rejected — crew notified"
          : "More info requested — crew notified"
    );
    refresh();
  };

  const openMobileDemo = () => {
    window.open(ROUTES.siteMaterialRequestMobile, "_blank");
  };

  const pendingCount = requests.filter((request) => request.status === "pending").length;

  return (
    <Box sx={{ p: 4, overflowY: "auto", height: "100%" }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 3, gap: 2 }}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Site Material Request
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Crew members raise requests on mobile. Office reviews, approves, and triggers fulfillment.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ExternalLink size={16} />}
            onClick={openMobileDemo}
            sx={{ flexShrink: 0 }}
          >
            Open Mobile Demo
          </Button>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "320px 1fr" },
            gap: 3,
            alignItems: "start",
          }}
        >
          <WorkspaceSection title={`Requests (${pendingCount} pending)`}>
            {requests.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No material requests yet. Open the mobile demo to submit one.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {requests.map((request) => {
                  const status = STATUS_CONFIG[request.status];
                  const isSelected = request.id === selectedId;
                  return (
                    <Box
                      key={request.id}
                      onClick={() => setSelectedId(request.id)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: 1,
                        borderColor: isSelected ? "primary.main" : "divider",
                        bgcolor: isSelected ? "action.selected" : "background.paper",
                        cursor: "pointer",
                        transition: "border-color 0.15s",
                        "&:hover": { borderColor: "primary.light" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {request.requestNumber}
                        </Typography>
                        <Chip label={status.label} color={status.color} size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {request.itemName} · {request.quantityNeeded} {request.unit}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {request.requestedBy} · {request.urgency}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}
          </WorkspaceSection>

          {selected ? (
            <Box>
              <WorkspaceSection title="Request Details (Read-only)">
                <Grid container spacing={2}>
                  <RequestDetailRow label="Request #" value={selected.requestNumber} />
                  <RequestDetailRow label="Project" value={`${selected.projectCode} — ${selected.projectName}`} />
                  <RequestDetailRow label="Requested By" value={selected.requestedBy} />
                  <RequestDetailRow label="Request Date & Time" value={formatDateTime(selected.requestDateTime)} />
                  <RequestDetailRow label="Item Name" value={selected.itemName} />
                  <RequestDetailRow label="Quantity Needed" value={`${selected.quantityNeeded} ${selected.unit}`} />
                  <RequestDetailRow label="Reason" value={selected.reason} />
                  <RequestDetailRow label="Urgency" value={selected.urgency} />
                  <RequestDetailRow label="Photo" value={selected.photoAttached ? "Attached" : "None"} />
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selected.notes || "—"}
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
                      onChange={(e) => setApprovalDecision(e.target.value as ApprovalDecision)}
                      fullWidth
                      size="small"
                      disabled={selected.status !== "pending" && selected.status !== "info_requested"}
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
                          disabled={selected.status !== "pending" && selected.status !== "info_requested"}
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
                          disabled={selected.status !== "pending" && selected.status !== "info_requested"}
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
                      disabled={selected.status !== "pending" && selected.status !== "info_requested"}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    {(selected.status === "pending" || selected.status === "info_requested") ? (
                      <Button
                        variant="contained"
                        startIcon={<CheckCircle size={16} />}
                        onClick={handleApprove}
                      >
                        Submit Decision
                      </Button>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                        {selected.status === "approved" ? (
                          <CheckCircle size={16} style={{ color: "var(--brand-green)" }} />
                        ) : (
                          <XCircle size={16} style={{ color: "var(--status-red)" }} />
                        )}
                        <Typography variant="body2">
                          Decision recorded — {STATUS_CONFIG[selected.status].label}
                        </Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </WorkspaceSection>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <Package size={18} style={{ flexShrink: 0, marginTop: 2 }} />
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Fulfillment Flow
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.7 }}>
                    Approve → Pull from Inventory / Raise PO / Subcontractor Supply → Materials Dispatched → Crew Confirms Receipt → Cost Added to Project Actuals
                  </Typography>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 8,
                color: "text.secondary",
              }}
            >
              <Clock size={32} style={{ opacity: 0.4, marginBottom: 12 }} />
              <Typography variant="body2">Select a request to review</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
