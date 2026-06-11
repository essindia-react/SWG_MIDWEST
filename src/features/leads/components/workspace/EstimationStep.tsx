import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Plus, Trash2 } from "lucide-react";
import type { LeadEstimationArea, LeadEstimationOverhead, LeadEstimationProduct } from "../../../../types/lead";
import type { InventoryProduct, ProductCategory } from "../../../inventory/types/inventory";
import { getProducts, subscribeInventory } from "../../../inventory/lib/inventoryStore";
import { MATERIAL_UNITS } from "../../../projects/constants/budgetConstants";
import {
  getEstimationAreaNameOptions,
  getSelectedEstimationAreaNames,
  getUnusedAreaNameOptions,
  removeProductsForArea,
  renameProductAreaReferences,
} from "../../lib/leadWorkspaceSync";
import { WorkspaceSection } from "./WorkspaceSection";
import { LabeledSelectField, SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const AREA_TYPES = ["Main Turf", "Putting Green", "Border"] as const;
const PRODUCT_TYPES = ["Turf", "Infill", "Base"] as const;
const OVERHEAD_UNITS = ["Flat Fee", "Percentage", "Per Sq Ft"] as const;

interface EstimationStepProps {
  values: WorkspaceFormValues;
  onChange: WorkspaceFormChange;
}

function updateArea(
  areas: LeadEstimationArea[],
  id: string,
  field: keyof LeadEstimationArea,
  value: string
): LeadEstimationArea[] {
  return areas.map((area) => (area.id === id ? { ...area, [field]: value } : area));
}

function updateProduct(
  products: LeadEstimationProduct[],
  id: string,
  updates: Partial<LeadEstimationProduct>
): LeadEstimationProduct[] {
  return products.map((product) => (product.id === id ? { ...product, ...updates } : product));
}

function updateOverhead(
  overheads: LeadEstimationOverhead[],
  id: string,
  field: keyof LeadEstimationOverhead,
  value: string
): LeadEstimationOverhead[] {
  return overheads.map((oh) => (oh.id === id ? { ...oh, [field]: value } : oh));
}

function inventoryCategoryToProductType(category: ProductCategory): string {
  if (category === "Turf") return "Turf";
  if (category === "Infill") return "Infill";
  if (category === "Base Material") return "Base";
  return "Turf";
}

function getMaterialsForArea(
  areaName: string,
  products: InventoryProduct[]
): InventoryProduct[] {
  const active = products.filter((p) => p.status === "Active");
  if (!areaName.trim()) return active;

  const lower = areaName.toLowerCase();
  if (lower.includes("putting")) {
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes("putting") ||
        p.category === "Turf" ||
        p.category === "Infill"
    );
  }
  if (lower.includes("pet")) {
    return active.filter(
      (p) =>
        p.name.toLowerCase().includes("pet") ||
        p.name.toLowerCase().includes("k9") ||
        p.category === "Turf" ||
        p.category === "Infill"
    );
  }
  if (lower.includes("sports")) {
    return active.filter((p) => p.category === "Turf" || p.category === "Base Material");
  }
  return active;
}

function formatProductLabel(product: InventoryProduct): string {
  return `${product.name} — $${product.sellingPrice.toFixed(2)}/${product.unit}`;
}

export function EstimationStep({ values, onChange }: EstimationStepProps) {
  const [inventoryProducts, setInventoryProducts] = useState(() =>
    getProducts().filter((p) => p.status === "Active")
  );

  const refreshInventory = useCallback(() => {
    setInventoryProducts(getProducts().filter((p) => p.status === "Active"));
  }, []);

  useEffect(() => subscribeInventory(refreshInventory), [refreshInventory]);

  const areaNameOptions = useMemo(
    () => getEstimationAreaNameOptions(values),
    [values.installationTypes]
  );

  const selectedAreaNames = useMemo(
    () => getSelectedEstimationAreaNames(values),
    [values.estimationAreas]
  );

  const unusedAreaNames = useMemo(
    () => getUnusedAreaNameOptions(values),
    [values.installationTypes, values.estimationAreas]
  );

  const defaultForArea = selectedAreaNames[0] ?? "";

  const handleAreaNameChange = (areaId: string, areaName: string) => {
    const currentArea = values.estimationAreas.find((area) => area.id === areaId);
    const previousName = currentArea?.areaName ?? "";
    const nextAreas = updateArea(values.estimationAreas, areaId, "areaName", areaName);

    onChange("estimationAreas", nextAreas);
    onChange(
      "estimationProducts",
      renameProductAreaReferences(values.estimationProducts, previousName, areaName)
    );
  };

  const handleRemoveArea = (areaId: string) => {
    const removedArea = values.estimationAreas.find((area) => area.id === areaId);
    const nextAreas = values.estimationAreas.filter((area) => area.id !== areaId);
    onChange("estimationAreas", nextAreas);
    if (removedArea?.areaName) {
      onChange(
        "estimationProducts",
        removeProductsForArea(values.estimationProducts, removedArea.areaName)
      );
    }
  };

  const addArea = () => {
    const nextAreaName = unusedAreaNames[0];
    if (!nextAreaName) return;

    onChange("estimationAreas", [
      ...values.estimationAreas,
      {
        id: `area-${Date.now()}`,
        areaName: nextAreaName,
        areaType: "Main Turf",
        areaLength: "",
        areaWidth: "",
        customArea: "",
      },
    ]);
  };

  const addProduct = () => {
    onChange("estimationProducts", [
      ...values.estimationProducts,
      {
        id: `prod-${Date.now()}`,
        forArea: defaultForArea,
        productId: "",
        productType: "Turf",
        productName: "",
        unit: "sq ft",
        quantity: "",
        cost: 0,
      },
    ]);
  };

  const addOverhead = () => {
    onChange("estimationOverheads", [
      ...values.estimationOverheads,
      { id: `oh-${Date.now()}`, title: "", rate: "", unit: "Flat Fee" },
    ]);
  };

  const handleProductSelect = (productRowId: string, productId: string) => {
    const inventoryProduct = inventoryProducts.find((p) => p.id === productId);
    if (!inventoryProduct) {
      onChange(
        "estimationProducts",
        updateProduct(values.estimationProducts, productRowId, {
          productId: "",
          productName: "",
          cost: 0,
        })
      );
      return;
    }

    onChange(
      "estimationProducts",
      updateProduct(values.estimationProducts, productRowId, {
        productId,
        productName: inventoryProduct.name,
        productType: inventoryCategoryToProductType(inventoryProduct.category),
        unit: inventoryProduct.unit,
        cost: inventoryProduct.sellingPrice,
      })
    );
  };

  const handleForAreaChange = (productRowId: string, forArea: string) => {
    const product = values.estimationProducts.find((p) => p.id === productRowId);
    if (!product) return;

    const filtered = getMaterialsForArea(forArea, inventoryProducts);
    const stillValid =
      !product.productId || filtered.some((p) => p.id === product.productId);

    onChange(
      "estimationProducts",
      updateProduct(values.estimationProducts, productRowId, {
        forArea,
        ...(stillValid
          ? {}
          : {
              productId: "",
              productName: "",
              cost: 0,
            }),
      })
    );
  };

  return (
    <>
      <WorkspaceSection title="Basic Info">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Estimation No" value={values.estimationNo} onChange={(v) => onChange("estimationNo", v)} disabled />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Date" type="date" value={values.estimationDate} onChange={(v) => onChange("estimationDate", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TextFieldInput label="Customer Name" value={values.estimationCustomerName} onChange={(v) => onChange("estimationCustomerName", v)} disabled />
          </Grid>
        </Grid>
      </WorkspaceSection>

      <WorkspaceSection title="Area Info">
        {areaNameOptions.length === 0 && (
          <Typography sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 2 }}>
            Select area types in the Inquiry step to populate area name options.
          </Typography>
        )}
        {values.estimationAreas.map((area, index) => (
          <Box
            key={area.id}
            sx={{
              p: 3,
              mb: 2,
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "grey.50",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
              <Typography sx={{ fontSize: "0.875rem", fontWeight: 700 }}>
                Area {index + 1}
              </Typography>
              {values.estimationAreas.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleRemoveArea(area.id)}
                >
                  <Trash2 size={16} />
                </IconButton>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
                {areaNameOptions.length > 0 ? (
                  <SelectField
                    label="Area Name"
                    value={area.areaName}
                    onChange={(v) => handleAreaNameChange(area.id, v)}
                    options={[
                      ...new Set([
                        ...(area.areaName ? [area.areaName] : []),
                        ...areaNameOptions,
                      ]),
                    ]}
                  />
                ) : (
                  <TextFieldInput
                    label="Area Name"
                    placeholder="Select areas in Inquiry first"
                    value={area.areaName}
                    onChange={(v) =>
                      onChange("estimationAreas", updateArea(values.estimationAreas, area.id, "areaName", v))
                    }
                    disabled
                  />
                )}
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
                <SelectField
                  label="Area Type"
                  value={area.areaType}
                  onChange={(v) => onChange("estimationAreas", updateArea(values.estimationAreas, area.id, "areaType", v))}
                  options={AREA_TYPES}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
                <TextFieldInput
                  label="Length (ft)"
                  type="number"
                  value={area.areaLength}
                  onChange={(v) => onChange("estimationAreas", updateArea(values.estimationAreas, area.id, "areaLength", v))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
                <TextFieldInput
                  label="Width (ft)"
                  type="number"
                  value={area.areaWidth}
                  onChange={(v) => onChange("estimationAreas", updateArea(values.estimationAreas, area.id, "areaWidth", v))}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
                <TextFieldInput
                  label="Custom Area"
                  placeholder="Optional"
                  value={area.customArea}
                  onChange={(v) => onChange("estimationAreas", updateArea(values.estimationAreas, area.id, "customArea", v))}
                />
              </Grid>
            </Grid>
          </Box>
        ))}
        <Button
          startIcon={<Plus size={16} />}
          onClick={addArea}
          disabled={unusedAreaNames.length === 0}
          sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.8125rem" }}
        >
          Add Area
        </Button>
      </WorkspaceSection>

      <WorkspaceSection title="Material Details">
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["For Area", "Material Type", "Material Name", "Unit", "Qty/Rate", "Cost", "Action"].map((h) => (
                  <TableCell key={h} sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {values.estimationProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: "center", color: "text.secondary", py: 3 }}>
                    No materials added yet
                  </TableCell>
                </TableRow>
              ) : (
                values.estimationProducts.map((product) => {
                  const materialOptions = getMaterialsForArea(
                    product.forArea,
                    inventoryProducts
                  ).map((p) => ({ value: p.id, label: formatProductLabel(p) }));

                  return (
                    <TableRow key={product.id}>
                      <TableCell sx={{ minWidth: 130 }}>
                        <SelectField
                          label=""
                          value={product.forArea ?? ""}
                          onChange={(v) => handleForAreaChange(product.id, v)}
                          options={selectedAreaNames}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 120 }}>
                        <SelectField
                          label=""
                          value={product.productType}
                          onChange={(v) =>
                            onChange(
                              "estimationProducts",
                              updateProduct(values.estimationProducts, product.id, { productType: v })
                            )
                          }
                          options={PRODUCT_TYPES}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 220 }}>
                        <LabeledSelectField
                          label=" "
                          value={product.productId ?? ""}
                          onChange={(v) => handleProductSelect(product.id, v)}
                          options={materialOptions}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth: 110 }}>
                        <SelectField
                          label=""
                          value={product.unit}
                          onChange={(v) =>
                            onChange(
                              "estimationProducts",
                              updateProduct(values.estimationProducts, product.id, { unit: v })
                            )
                          }
                          options={MATERIAL_UNITS}
                        />
                      </TableCell>
                      <TableCell>
                        <TextFieldInput
                          label=""
                          type="number"
                          placeholder="0"
                          value={product.quantity}
                          onChange={(v) =>
                            onChange(
                              "estimationProducts",
                              updateProduct(values.estimationProducts, product.id, { quantity: v })
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>
                          ${(Number(product.quantity) || 0) * (product.cost || 0) > 0
                            ? ((Number(product.quantity) || 0) * (product.cost || 0)).toFixed(2)
                            : product.cost.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            onChange(
                              "estimationProducts",
                              values.estimationProducts.filter((p) => p.id !== product.id)
                            )
                          }
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <Box sx={{ p: 2 }}>
            <Button
              startIcon={<Plus size={16} />}
              onClick={addProduct}
              disabled={selectedAreaNames.length === 0}
              sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.8125rem" }}
            >
              Add Material Item
            </Button>
          </Box>
        </Box>
      </WorkspaceSection>

      <WorkspaceSection title="Overheads">
        {values.estimationOverheads.map((overhead, index) => (
          <Box key={overhead.id} sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600, color: "text.secondary" }}>
                Overhead {index + 1}
              </Typography>
              {values.estimationOverheads.length > 1 && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    onChange(
                      "estimationOverheads",
                      values.estimationOverheads.filter((o) => o.id !== overhead.id)
                    )
                  }
                >
                  <Trash2 size={16} />
                </IconButton>
              )}
            </Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextFieldInput
                  label="Title"
                  placeholder="Shipping / Labor"
                  value={overhead.title}
                  onChange={(v) =>
                    onChange("estimationOverheads", updateOverhead(values.estimationOverheads, overhead.id, "title", v))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextFieldInput
                  label="Rate"
                  type="number"
                  placeholder="0"
                  value={overhead.rate}
                  onChange={(v) =>
                    onChange("estimationOverheads", updateOverhead(values.estimationOverheads, overhead.id, "rate", v))
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <SelectField
                  label="Unit"
                  value={overhead.unit}
                  onChange={(v) =>
                    onChange("estimationOverheads", updateOverhead(values.estimationOverheads, overhead.id, "unit", v))
                  }
                  options={OVERHEAD_UNITS}
                />
              </Grid>
            </Grid>
          </Box>
        ))}
        <Button startIcon={<Plus size={16} />} onClick={addOverhead} sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.8125rem" }}>
          Add Overhead
        </Button>
      </WorkspaceSection>
    </>
  );
}
