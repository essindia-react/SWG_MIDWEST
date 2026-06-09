import React from "react";
import { Box, Grid, Typography } from "@mui/material";
import { WorkspaceSection } from "../../../leads/components/workspace/WorkspaceSection";
import { TRANSACTION_TYPE_COLORS } from "../../constants/inventoryConstants";
import { formatCurrency, formatDateTime } from "../../lib/inventoryHelpers";
import type { StockLedgerEntry } from "../../types/inventory";
import { InventorySlideDrawer } from "../shared/InventorySlideDrawer";
import { InventoryStatusChip } from "../shared/InventoryStatusChip";

interface StockLedgerDrawerProps {
  entry: StockLedgerEntry;
  onClose: () => void;
}

function DetailRow({ label, value }: { label: string; value: string }) {
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

export function StockLedgerDrawer({ entry, onClose }: StockLedgerDrawerProps) {
  const colors = TRANSACTION_TYPE_COLORS[entry.transactionType];

  return (
    <InventorySlideDrawer
      title={entry.referenceNumber}
      subtitle={entry.transactionType}
      onClose={onClose}
      width={520}
    >
      <WorkspaceSection title="Transaction Information">
        <Grid container spacing={2}>
          <DetailRow label="Transaction ID" value={entry.id} />
          <DetailRow label="Date" value={formatDateTime(entry.date)} />
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Type
            </Typography>
            <InventoryStatusChip
              label={entry.transactionType}
              bg={colors?.bg ?? "#F5F5F5"}
              color={colors?.color ?? "#616161"}
            />
          </Grid>
          <DetailRow label="Product" value={entry.productName} />
          {entry.projectName && <DetailRow label="Project" value={entry.projectName} />}
          <DetailRow
            label="Quantity"
            value={`${entry.quantity >= 0 ? "+" : ""}${entry.quantity}`}
          />
          <DetailRow label="Unit Cost" value={formatCurrency(entry.unitCost)} />
          <DetailRow label="Total Value" value={formatCurrency(entry.totalValue)} />
          <DetailRow label="Created By" value={entry.createdBy} />
          {entry.reason && <DetailRow label="Reason" value={entry.reason} />}
          {entry.comments && <DetailRow label="Comments" value={entry.comments} />}
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Inventory Impact">
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: entry.quantity >= 0 ? "rgba(46,125,50,0.06)" : "rgba(198,40,40,0.06)",
            border: 1,
            borderColor: entry.quantity >= 0 ? "rgba(46,125,50,0.2)" : "rgba(198,40,40,0.2)",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {entry.quantity >= 0 ? "Stock Increased" : "Stock Decreased"} by{" "}
            {Math.abs(entry.quantity)} units
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Value impact: {formatCurrency(entry.totalValue)}
          </Typography>
        </Box>
      </WorkspaceSection>

      {entry.relatedDocuments && entry.relatedDocuments.length > 0 && (
        <WorkspaceSection title="Related Documents">
          {entry.relatedDocuments.map((doc) => (
            <Typography key={doc} variant="body2" sx={{ mb: 0.5, color: "primary.main" }}>
              {doc}
            </Typography>
          ))}
        </WorkspaceSection>
      )}

      {entry.auditTrail && entry.auditTrail.length > 0 && (
        <WorkspaceSection title="Audit Trail">
          {entry.auditTrail.map((audit, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                gap: 2,
                py: 1.5,
                borderBottom: i < entry.auditTrail!.length - 1 ? 1 : 0,
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  mt: 0.75,
                  flexShrink: 0,
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {audit.action}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {audit.user} · {formatDateTime(audit.timestamp)}
                </Typography>
                {audit.details && (
                  <Typography variant="body2" sx={{ mt: 0.25 }}>
                    {audit.details}
                  </Typography>
                )}
              </Box>
            </Box>
          ))}
        </WorkspaceSection>
      )}
    </InventorySlideDrawer>
  );
}
