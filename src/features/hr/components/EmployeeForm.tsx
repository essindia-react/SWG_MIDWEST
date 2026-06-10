import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { X } from "lucide-react";
import {
  TextFieldInput,
  SelectField,
} from "../../leads/components/workspace/workspaceFields";
import { Employee, EmployeeRole, EmploymentType, PayType, TaxFilingStatus, EmployeeStatus } from "../../../types/hr";

interface EmployeeFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: Employee;
  title: string;
}

const ROLES: EmployeeRole[] = ["Crew Leader", "Installer", "Supervisor", "Office Staff", "Driver"];
const EMPLOYMENT_TYPES: EmploymentType[] = ["Full-time", "Part-time", "Subcontractor"];
const PAY_TYPES: PayType[] = ["Hourly", "Salary"];
const TAX_FILING_STATUSES: TaxFilingStatus[] = ["Single", "Married", "Head of Household"];
const STATUSES: EmployeeStatus[] = ["Active", "Inactive", "Terminated"];

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  role: "Installer" as EmployeeRole,
  employmentType: "Full-time" as EmploymentType,
  payType: "Hourly" as PayType,
  payRate: 0,
  phone: "",
  email: "",
  state: "OH",
  taxFilingStatus: "Single" as TaxFilingStatus,
  bankingDetails: "",
  startDate: new Date().toISOString().split("T")[0],
  status: "Active" as EmployeeStatus,
};

export function EmployeeForm({ open, onClose, onSubmit, initialData, title }: EmployeeFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        role: initialData.role,
        employmentType: initialData.employmentType,
        payType: initialData.payType,
        payRate: initialData.payRate,
        phone: initialData.phone,
        email: initialData.email,
        state: initialData.state,
        taxFilingStatus: initialData.taxFilingStatus,
        bankingDetails: initialData.bankingDetails,
        startDate: initialData.startDate,
        status: initialData.status,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData, open]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    onSubmit(form);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
        {title}
        <Button onClick={onClose} color="inherit" sx={{ minWidth: "auto", p: 0.5 }}>
          <X size={20} />
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ py: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
            Personal Information
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="First Name"
                value={form.firstName}
                onChange={(v) => handleChange("firstName", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Last Name"
                value={form.lastName}
                onChange={(v) => handleChange("lastName", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => handleChange("email", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Phone"
                value={form.phone}
                onChange={(v) => handleChange("phone", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="State"
                value={form.state}
                onChange={(v) => handleChange("state", v)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Start Date"
                type="date"
                value={form.startDate}
                onChange={(v) => handleChange("startDate", v)}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
            Employment & Pay
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SelectField
                label="Role"
                value={form.role}
                onChange={(v) => handleChange("role", v)}
                options={ROLES}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SelectField
                label="Employment Type"
                value={form.employmentType}
                onChange={(v) => handleChange("employmentType", v)}
                options={EMPLOYMENT_TYPES}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SelectField
                label="Status"
                value={form.status}
                onChange={(v) => handleChange("status", v)}
                options={STATUSES}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <SelectField
                label="Pay Type"
                value={form.payType}
                onChange={(v) => handleChange("payType", v)}
                options={PAY_TYPES}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextFieldInput
                label={`Pay Rate (${form.payType === "Hourly" ? "$/hr" : "$/yr"})`}
                type="number"
                value={String(form.payRate)}
                onChange={(v) => handleChange("payRate", Number(v))}
                required
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
            Tax & Banking
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <SelectField
                label="Tax Filing Status"
                value={form.taxFilingStatus}
                onChange={(v) => handleChange("taxFilingStatus", v)}
                options={TAX_FILING_STATUSES}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextFieldInput
                label="Banking Details (Bank - Last 4 Digits)"
                value={form.bankingDetails}
                onChange={(v) => handleChange("bankingDetails", v)}
                placeholder="e.g. Chase - 1234"
                required
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {initialData ? "Save Changes" : "Add Employee"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
