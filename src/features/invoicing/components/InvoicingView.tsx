import React, { useCallback, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { Plus } from "lucide-react";
import { useInvoicesWithProjects } from "../../../hooks/useInvoices";
import type { Invoice } from "../../../types/invoice";
import { CreateInvoiceModal } from "./CreateInvoiceModal";
import { InvoicingInvoiceList } from "./InvoicingInvoiceList";
import { InvoicingMetricsDashboard } from "./InvoicingMetricsDashboard";

export function InvoicingView() {
  const { projects, invoices } = useInvoicesWithProjects();

  return (
    <Box
      sx={{
        position: "relative",
        flex: 1,
        overflow: "auto",
        p: { xs: 2, md: 3 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <InvoicingMetricsDashboard projects={projects} invoices={invoices} />
        <InvoicingInvoiceList
          invoices={invoices}
          projects={projects}
          // onInvoiceClick={handleInvoiceClick}
        />
      </Box>
    </Box>
  );
}
