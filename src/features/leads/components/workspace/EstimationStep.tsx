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
import { WorkspaceSection } from "./WorkspaceSection";
import { SelectField, TextFieldInput } from "./workspaceFields";
import type { WorkspaceFormChange, WorkspaceFormValues } from "./types";

const AREA_TYPES = ["Main Turf", "Putting Green", "Border"] as const;
const PRODUCT_TYPES = ["Turf", "Infill", "Base"] as const;
const OVERHEAD_UNITS = ["Flat Fee", "Percentage", "Per Sq Ft"] as const;

interface EstimationStepProps {
  values: WorkspaceFormValues;
  onChange: WorkspaceFormChange;
}

export function EstimationStep({ values, onChange }: EstimationStepProps) {
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

      <Box
        sx={{
          p: 3,
          mb: 4,
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
          bgcolor: "grey.50",
        }}
      >
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 700, mb: 2 }}>Area Info</Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
            <TextFieldInput label="Area Name" placeholder="Backyard" value={values.areaName} onChange={(v) => onChange("areaName", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
            <SelectField label="Area Type" value={values.areaType} onChange={(v) => onChange("areaType", v)} options={AREA_TYPES} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
            <TextFieldInput label="Length (ft)" type="number" value={values.areaLength} onChange={(v) => onChange("areaLength", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
            <TextFieldInput label="Width (ft)" type="number" value={values.areaWidth} onChange={(v) => onChange("areaWidth", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 2.4 }}>
            <TextFieldInput label="Custom Area" placeholder="Optional" value={values.customArea} onChange={(v) => onChange("customArea", v)} />
          </Grid>
        </Grid>
      </Box>

      <WorkspaceSection title="Product Details">
        <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden", bgcolor: "background.paper" }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                {["Product Type", "Product", "Unit", "Qty/Rate", "Cost", "Action"].map((h) => (
                  <TableCell key={h} sx={{ fontSize: "0.75rem", color: "text.secondary", fontWeight: 600 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ minWidth: 120 }}>
                  <SelectField label="" value="Turf" onChange={() => {}} options={PRODUCT_TYPES} />
                </TableCell>
                <TableCell>
                  <TextFieldInput label="" placeholder="Product name" value="" onChange={() => {}} />
                </TableCell>
                <TableCell>
                  <TextFieldInput label="" value="sq ft" onChange={() => {}} />
                </TableCell>
                <TableCell>
                  <TextFieldInput label="" type="number" placeholder="0" value="" onChange={() => {}} />
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "0.8125rem", fontWeight: 600 }}>$0.00</Typography>
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="error">
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Box sx={{ p: 2 }}>
            <Button startIcon={<Plus size={16} />} sx={{ color: "primary.main", fontWeight: 600, fontSize: "0.8125rem" }}>
              Add Product Item
            </Button>
          </Box>
        </Box>
      </WorkspaceSection>

      <WorkspaceSection title="Overheads">
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextFieldInput label="Title" placeholder="Shipping / Labor" value={values.overheadTitle} onChange={(v) => onChange("overheadTitle", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextFieldInput label="Rate" type="number" placeholder="0" value={values.overheadRate} onChange={(v) => onChange("overheadRate", v)} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <SelectField label="Unit" value={values.overheadUnit} onChange={(v) => onChange("overheadUnit", v)} options={OVERHEAD_UNITS} />
          </Grid>
        </Grid>
      </WorkspaceSection>
    </>
  );
}
