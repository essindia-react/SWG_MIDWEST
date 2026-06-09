import React from "react";
import { Box } from "@mui/material";
import { useSearchParams } from "react-router";
import type { InventoryTabId } from "../constants/inventoryConstants";
import { MaterialRequestsTab } from "./material-requests/MaterialRequestsTab";
import { ProductsTab } from "./products/ProductsTab";
import { ProductSwapsTab } from "./product-swaps/ProductSwapsTab";
import { InventoryReportsTab } from "./reports/InventoryReportsTab";
import { StockLedgerTab } from "./stock-ledger/StockLedgerTab";

const VALID_TABS: InventoryTabId[] = [
  "master",
  "stock-ledger",
  "material-requests",
  "product-swaps",
  "reports",
];

function parseTab(tab: string | null): InventoryTabId {
  if (tab && VALID_TABS.includes(tab as InventoryTabId)) {
    return tab as InventoryTabId;
  }
  return "master";
}

export function InventoryView() {
  const [searchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get("tab"));

  const renderTab = () => {
    switch (activeTab) {
      case "master":
        return <ProductsTab />;
      case "stock-ledger":
        return <StockLedgerTab />;
      case "material-requests":
        return <MaterialRequestsTab />;
      case "product-swaps":
        return <ProductSwapsTab />;
      case "reports":
        return <InventoryReportsTab />;
      default:
        return <ProductsTab />;
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        p: { xs: 2, md: 3 },
        bgcolor: "background.default",
        height: "100%",
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>{renderTab()}</Box>
    </Box>
  );
}
