import React, { useMemo } from "react";
import { Box } from "@mui/material";
import { useInvoicesWithProjects } from "../../../hooks/useInvoices";
import { DEMO_INVOICE_COUNT } from "../constants/invoicingConstants";
import { InvoicingInvoiceList } from "./InvoicingInvoiceList";
import { InvoicingMetricsDashboard } from "./InvoicingMetricsDashboard";

export function InvoicingView() {
  const { projects, invoices } = useInvoicesWithProjects();

  const displayedInvoices = useMemo(
    () =>
      [...invoices]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, DEMO_INVOICE_COUNT),
    [invoices],
  );

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
        <InvoicingMetricsDashboard projects={projects} invoices={displayedInvoices} />
        <InvoicingInvoiceList invoices={invoices} projects={projects} />
      </Box>
    </Box>
  );
}
