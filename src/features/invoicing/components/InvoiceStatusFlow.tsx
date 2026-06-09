import React from "react";
import { Box, Typography } from "@mui/material";
import { Check } from "lucide-react";
import type { InvoiceStatus } from "../../../types/invoice";
import {
  INVOICE_STATUS_OPTIONS,
  invoiceStatusColor,
  invoiceStatusDescription,
  invoiceStatusLabel,
} from "../constants/invoicingConstants";

const ICON_SIZE = 40;
const BRAND_GREEN = "#2E7D32";

const FLOW_ORDER: InvoiceStatus[] = [
  "draft",
  "sent",
  "viewed",
  "paid",
  "partially-paid",
  "overdue",
  "void",
];

function getOption(value: InvoiceStatus) {
  return INVOICE_STATUS_OPTIONS.find((o) => o.value === value)!;
}

function getEffectiveIndex(status: InvoiceStatus): number {
  return FLOW_ORDER.indexOf(status);
}

function getStepState(
  stepIndex: number,
  currentStatus: InvoiceStatus | null
): "completed" | "active" | "upcoming" {
  if (!currentStatus) return "upcoming";

  const currentIndex = getEffectiveIndex(currentStatus);
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "upcoming";
}

interface InvoiceStatusFlowProps {
  currentStatus: InvoiceStatus | null;
  invoiceNumber?: string;
}

export function InvoiceStatusFlow({ currentStatus, invoiceNumber }: InvoiceStatusFlowProps) {
  const activeIndex = currentStatus ? getEffectiveIndex(currentStatus) : -1;

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: 1,
          pt: 0.5,
          pb: 0.5,
          minHeight: ICON_SIZE + 52,
        }}
      >
        {/* Background track */}
        <Box
          sx={{
            position: "absolute",
            top: ICON_SIZE / 2 - 1,
            left: `calc(${ICON_SIZE / 2}px + 4%)`,
            right: `calc(${ICON_SIZE / 2}px + 4%)`,
            height: 2,
            bgcolor: "#E2E8F0",
            borderRadius: 1,
            zIndex: 0,
          }}
        />

        {/* Progress track */}
        {currentStatus && activeIndex > 0 && (
          <Box
            sx={{
              position: "absolute",
              top: ICON_SIZE / 2 - 1,
              left: `calc(${ICON_SIZE / 2}px + 4%)`,
              width: `calc(${(activeIndex / (FLOW_ORDER.length - 1)) * 92}% )`,
              height: 2,
              bgcolor: BRAND_GREEN,
              borderRadius: 1,
              zIndex: 0,
              transition: "width 0.35s ease",
            }}
          />
        )}

        {FLOW_ORDER.map((status, index) => {
          const opt = getOption(status);
          const stepState = getStepState(index, currentStatus);
          const isActive = stepState === "active";
          const isCompleted = stepState === "completed";
          const isFilled = isActive || isCompleted;
          const colors = invoiceStatusColor(status);

          return (
            <Box
              key={status}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: "1 1 0",
                minWidth: 72,
                zIndex: 1,
              }}
            >
              <Box
                sx={{
                  width: ICON_SIZE,
                  height: ICON_SIZE,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  bgcolor: isFilled ? (isActive ? colors.color : BRAND_GREEN) : "#FFFFFF",
                  color: isFilled ? "#FFFFFF" : "#94A3B8",
                  border: isFilled ? "none" : "2px solid #E2E8F0",
                  boxShadow: isActive ? `0 0 0 5px ${colors.bg}` : "none",
                  transition: "box-shadow 0.2s ease, background-color 0.2s ease",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                }}
              >
                {isCompleted ? <Check size={18} strokeWidth={2.5} /> : index + 1}
              </Box>

              <Typography
                sx={{
                  mt: 1.25,
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                  color: isActive ? colors.color : isCompleted ? "#64748B" : "#94A3B8",
                  textAlign: "center",
                  lineHeight: 1.25,
                  px: 0.25,
                }}
              >
                {opt.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
