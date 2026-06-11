import React from "react";
import { Box, Typography } from "@mui/material";
import { Truck } from "lucide-react";
import {
  getMaterialRequestsForTask,
  MATERIAL_REQUEST_STATUS_LABELS,
} from "../lib/taskMaterialRequestHelpers";

interface TaskMaterialRequestStatusSummaryProps {
  projectCode: string;
  taskId: string;
  taskName: string;
  refreshKey?: number;
  hideEmpty?: boolean;
  compact?: boolean;
}

export function TaskMaterialRequestStatusSummary({
  projectCode,
  taskId,
  taskName,
  hideEmpty = false,
  compact = false,
}: TaskMaterialRequestStatusSummaryProps) {
  const requests = getMaterialRequestsForTask(projectCode, taskId, taskName);

  if (requests.length === 0) {
    if (hideEmpty) return null;
    return (
      <Typography
        sx={{
          fontSize: "0.75rem",
          color: "text.disabled",
          fontStyle: "italic",
        }}
      >
        {compact
          ? "No requests yet — use + Request"
          : "Click to submit a material request for this task"}
      </Typography>
    );
  }

  if (compact) {
    const approvedCount = requests.filter(
      (r) => r.status === "approved",
    ).length;
    const pendingCount = requests.filter((r) => r.status === "pending").length;

    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.75,
          alignItems: "center",
        }}
      >
        <Typography
          sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}
        >
          {requests.length} request{requests.length !== 1 ? "s" : ""} placed
        </Typography>
        {pendingCount > 0 && (
          <Typography
            sx={{ fontSize: "0.6875rem", color: "#D97706", fontWeight: 600 }}
          >
            · {pendingCount} pending
          </Typography>
        )}
        {/* {approvedCount > 0 && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Truck size={12} color="#2E7D32" />
            <Typography
              sx={{ fontSize: "0.6875rem", color: "#2E7D32", fontWeight: 600 }}
            >
              {approvedCount} await delivery
            </Typography>
          </Box>
        )} */}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
      {requests.map((request) => {
        const statusConfig = MATERIAL_REQUEST_STATUS_LABELS[request.status];

        return (
          <Box
            key={request.id}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
              p: 1,
              borderRadius: 1,
              bgcolor: statusConfig.bg,
              border: 1,
              borderColor: "transparent",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 0.75,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: statusConfig.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                }}
              >
                {statusConfig.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "text.primary",
                }}
              >
                {request.requestNumber}
              </Typography>
              <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                · {request.itemName} ({request.quantityNeeded} {request.unit})
              </Typography>
            </Box>
            {request.status === "approved" && statusConfig.message && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Truck size={12} color="#2E7D32" />
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#2E7D32",
                  }}
                >
                  {statusConfig.message}
                </Typography>
              </Box>
            )}
            {request.status === "rejected" && request.notesToCrew && (
              <Typography
                sx={{ fontSize: "0.6875rem", color: "text.secondary" }}
              >
                {request.notesToCrew}
              </Typography>
            )}
            {request.status === "info_requested" && request.notesToCrew && (
              <Typography
                sx={{ fontSize: "0.6875rem", color: "text.secondary" }}
              >
                Office: {request.notesToCrew}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
