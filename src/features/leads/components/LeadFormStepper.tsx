import React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import {
  Briefcase,
  ClipboardList,
  Filter,
  MapPin,
  NotebookPen,
  Paperclip,
  Shovel,
  Upload,
  User,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  BUDGET_RANGES,
  DEFAULT_ASSIGNED_REP,
  DEFAULT_LEAD_SOURCE,
  EXISTING_SURFACES,
  FORM_PIPELINE_STAGES,
  FORM_STAGE_TO_STATUS,
  LEAD_PRIORITIES,
  LEAD_SOURCES,
  PROPERTY_TYPES,
  PROJECT_TYPES,
  SALES_REPS,
  TURF_PROJECT_TYPES,
  TURF_STYLES,
  US_STATES,
} from "../../../lib/constants";
import {
  formatPhone,
  isValidPhone,
  parsePhoneToDigits,
} from "../../../lib/formatters";
import { getOhioRegionLabel } from "../../../lib/leadHelpers";
import { zipToOhioRegion } from "../../../lib/zipToRegion";
import type {
  ExistingSurface,
  FormPipelineStage,
  LeadFormInput,
  LeadPriority,
  LeadSource,
  ProjectType,
  PropertyType,
  TurfStyle,
} from "../../../types/lead";
import { FormSection } from "./FormSection";

export interface LeadFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  projectType: ProjectType;
  propertyType: PropertyType;
  squareFootageEstimate: string;
  budgetRange: LeadFormInput["budgetRange"] | "";
  desiredInstallDate: string;
  existingSurface: ExistingSurface;
  drainageRequired: boolean;
  removeExistingGrass: boolean;
  hoaApprovalRequired: boolean;
  turfStyle: TurfStyle | "";
  coolingInfill: boolean;
  leadSource: LeadSource;
  priority: LeadPriority;
  formPipelineStage: FormPipelineStage;
  assignedRep: string;
  manualEstimatedRevenue: string;
  nextFollowUpDate: string;
  customerRequirements: string;
  internalNotes: string;
}

const EMPTY_FORM: LeadFormValues = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  company: "",
  address: "",
  city: "",
  state: "OH",
  zipCode: "",
  projectType: "artificial-turf",
  propertyType: "residential",
  squareFootageEstimate: "",
  budgetRange: "",
  desiredInstallDate: "",
  existingSurface: "grass",
  drainageRequired: false,
  removeExistingGrass: false,
  hoaApprovalRequired: false,
  turfStyle: "",
  coolingInfill: false,
  leadSource: DEFAULT_LEAD_SOURCE,
  priority: "medium",
  formPipelineStage: "new",
  assignedRep: DEFAULT_ASSIGNED_REP,
  manualEstimatedRevenue: "",
  nextFollowUpDate: "",
  customerRequirements: "",
  internalNotes: "",
};

const STEPS = [
  "Contact",
  "Address",
  "Project",
  "Lead Info",
  "Notes",
] as const;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "6px",
    fontSize: "0.875rem",
  },
};

type FormErrors = Partial<Record<keyof LeadFormValues, string>>;

interface LeadFormStepperProps {
  onSubmit: (input: LeadFormInput) => void;
  onCancel: () => void;
}

function validateStep(step: number, values: LeadFormValues): FormErrors {
  const errors: FormErrors = {};

  if (step === 0) {
    if (!values.firstName.trim()) errors.firstName = "First name is required";
    if (!values.lastName.trim()) errors.lastName = "Last name is required";
    if (!values.phone.trim()) {
      errors.phone = "Phone is required";
    } else if (!isValidPhone(values.phone)) {
      errors.phone = "Enter a valid 10-digit phone number";
    }
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "Enter a valid email address";
    }
  }

  if (step === 2 && !values.projectType) {
    errors.projectType = "Project type is required";
  }

  return errors;
}

function toLeadInput(values: LeadFormValues): LeadFormInput {
  const status = FORM_STAGE_TO_STATUS[values.formPipelineStage];

  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim(),
    phone: formatPhone(parsePhoneToDigits(values.phone)),
    company: values.company.trim() || undefined,
    address: values.address.trim(),
    city: values.city.trim(),
    state: values.state,
    zipCode: values.zipCode.replace(/\D/g, "").slice(0, 5),
    leadSource: values.leadSource,
    projectType: values.projectType,
    propertyType: values.propertyType,
    projectSubtype:
      values.propertyType === "residential" || values.propertyType === "commercial"
        ? values.propertyType
        : undefined,
    squareFootageEstimate: values.squareFootageEstimate
      ? Number(values.squareFootageEstimate)
      : undefined,
    budgetRange: values.budgetRange || undefined,
    desiredInstallDate: values.desiredInstallDate || undefined,
    priority: values.priority,
    existingSurface: values.existingSurface,
    drainageRequired: values.drainageRequired,
    removeExistingGrass: values.removeExistingGrass,
    hoaApprovalRequired: values.hoaApprovalRequired,
    turfStyle: values.turfStyle || undefined,
    coolingInfill: values.coolingInfill,
    customerRequirements: values.customerRequirements.trim() || undefined,
    internalNotes: values.internalNotes.trim() || undefined,
    nextFollowUpDate: values.nextFollowUpDate || undefined,
    assignedRep: values.assignedRep,
    status,
    formPipelineStage: values.formPipelineStage,
    manualEstimatedRevenue: values.manualEstimatedRevenue
      ? Number(values.manualEstimatedRevenue)
      : undefined,
  };
}

export function LeadFormStepper({ onSubmit, onCancel }: LeadFormStepperProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [values, setValues] = useState<LeadFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [detectedRegion, setDetectedRegion] = useState("Columbus");

  const showTurfSpecial = useMemo(
    () => TURF_PROJECT_TYPES.includes(values.projectType),
    [values.projectType]
  );

  useEffect(() => {
    if (values.zipCode.replace(/\D/g, "").length >= 3) {
      setDetectedRegion(getOhioRegionLabel(zipToOhioRegion(values.zipCode)));
    } else {
      setDetectedRegion(getOhioRegionLabel("columbus"));
    }
  }, [values.zipCode]);

  const setField = <K extends keyof LeadFormValues>(
    field: K,
    value: LeadFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    const stepErrors = validateStep(activeStep, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setActiveStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrors({});
    setActiveStep((s) => s - 1);
  };

  const handleSubmit = () => {
    const stepErrors = validateStep(activeStep, values);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    onSubmit(toLeadInput(values));
    setValues(EMPTY_FORM);
    setErrors({});
    setActiveStep(0);
    setAttachmentNames([]);
  };

  const handleSaveDraft = () => {
    toast.info("Draft saved locally for this session");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachmentNames(Array.from(files).map((f) => f.name));
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <FormSection icon={User} title="Contact Information">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="First Name"
                  value={values.firstName}
                  onChange={(e) => setField("firstName", e.target.value)}
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Last Name"
                  value={values.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  size="small"
                  label="Phone Number"
                  value={values.phone}
                  onChange={(e) =>
                    setField("phone", formatPhone(parsePhoneToDigits(e.target.value)))
                  }
                  placeholder="(614) 555-0100"
                  error={Boolean(errors.phone)}
                  helperText={errors.phone}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email Address"
                  type="email"
                  value={values.email}
                  onChange={(e) => setField("email", e.target.value)}
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Company Name"
                  value={values.company}
                  onChange={(e) => setField("company", e.target.value)}
                  placeholder="Optional"
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </FormSection>
        );

      case 1:
        return (
          <FormSection icon={MapPin} title="Address Information">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Street Address"
                  value={values.address}
                  onChange={(e) => setField("address", e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="City"
                  value={values.city}
                  onChange={(e) => setField("city", e.target.value)}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel>State</InputLabel>
                  <Select
                    label="State"
                    value={values.state}
                    onChange={(e) => setField("state", e.target.value)}
                  >
                    {US_STATES.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Zip Code"
                  value={values.zipCode}
                  onChange={(e) =>
                    setField("zipCode", e.target.value.replace(/\D/g, "").slice(0, 5))
                  }
                  helperText={`Region: ${detectedRegion}`}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </FormSection>
        );

      case 2:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormSection icon={Briefcase} title="Project Information">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" required sx={fieldSx}>
                    <InputLabel>Project Type</InputLabel>
                    <Select
                      label="Project Type"
                      value={values.projectType}
                      onChange={(e) =>
                        setField("projectType", e.target.value as ProjectType)
                      }
                    >
                      {PROJECT_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={fieldSx}>
                    <InputLabel>Property Type</InputLabel>
                    <Select
                      label="Property Type"
                      value={values.propertyType}
                      onChange={(e) =>
                        setField("propertyType", e.target.value as PropertyType)
                      }
                    >
                      {PROPERTY_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Area Size (Sq Ft)"
                    type="number"
                    value={values.squareFootageEstimate}
                    onChange={(e) => setField("squareFootageEstimate", e.target.value)}
                    placeholder="e.g., 1500"
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={fieldSx}>
                    <InputLabel>Budget Range</InputLabel>
                    <Select
                      label="Budget Range"
                      value={values.budgetRange}
                      onChange={(e) =>
                        setField(
                          "budgetRange",
                          e.target.value as LeadFormValues["budgetRange"]
                        )
                      }
                    >
                      <MenuItem value="">
                        <em>Select budget...</em>
                      </MenuItem>
                      {BUDGET_RANGES.map((range) => (
                        <MenuItem key={range.value} value={range.value}>
                          {range.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Desired Installation Date"
                    type="date"
                    value={values.desiredInstallDate}
                    onChange={(e) => setField("desiredInstallDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection icon={Shovel} title="Site Details">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small" sx={fieldSx}>
                    <InputLabel>Existing Surface</InputLabel>
                    <Select
                      label="Existing Surface"
                      value={values.existingSurface}
                      onChange={(e) =>
                        setField("existingSurface", e.target.value as ExistingSurface)
                      }
                    >
                      {EXISTING_SURFACES.map((surface) => (
                        <MenuItem key={surface.value} value={surface.value}>
                          {surface.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.drainageRequired}
                          onChange={(e) => setField("drainageRequired", e.target.checked)}
                        />
                      }
                      label="Drainage required / assessment needed"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.removeExistingGrass}
                          onChange={(e) =>
                            setField("removeExistingGrass", e.target.checked)
                          }
                        />
                      }
                      label="Remove existing grass / excavation"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.hoaApprovalRequired}
                          onChange={(e) =>
                            setField("hoaApprovalRequired", e.target.checked)
                          }
                        />
                      }
                      label="HOA approval required"
                    />
                  </Box>
                </Grid>
              </Grid>
            </FormSection>

            {showTurfSpecial && (
              <FormSection icon={ClipboardList} title="Special Requirements" variant="highlight">
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControl fullWidth size="small" sx={fieldSx}>
                      <InputLabel>Preferred Turf Style</InputLabel>
                      <Select
                        label="Preferred Turf Style"
                        value={values.turfStyle}
                        onChange={(e) =>
                          setField("turfStyle", e.target.value as TurfStyle | "")
                        }
                      >
                        <MenuItem value="">
                          <em>Select style...</em>
                        </MenuItem>
                        {TURF_STYLES.map((style) => (
                          <MenuItem key={style.value} value={style.value}>
                            {style.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.coolingInfill}
                          onChange={(e) => setField("coolingInfill", e.target.checked)}
                        />
                      }
                      label="Add cooling infill"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </FormSection>
            )}
          </Box>
        );

      case 3:
        return (
          <FormSection icon={Filter} title="Lead Information">
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" required sx={fieldSx}>
                  <InputLabel>Lead Source</InputLabel>
                  <Select
                    label="Lead Source"
                    value={values.leadSource}
                    onChange={(e) =>
                      setField("leadSource", e.target.value as LeadSource)
                    }
                  >
                    {LEAD_SOURCES.map((source) => (
                      <MenuItem key={source.value} value={source.value}>
                        {source.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    label="Priority"
                    value={values.priority}
                    onChange={(e) =>
                      setField("priority", e.target.value as LeadPriority)
                    }
                  >
                    {LEAD_PRIORITIES.map((p) => (
                      <MenuItem key={p.value} value={p.value}>
                        {p.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel>Pipeline Stage</InputLabel>
                  <Select
                    label="Pipeline Stage"
                    value={values.formPipelineStage}
                    onChange={(e) =>
                      setField(
                        "formPipelineStage",
                        e.target.value as FormPipelineStage
                      )
                    }
                  >
                    {FORM_PIPELINE_STAGES.map((stage) => (
                      <MenuItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth size="small" sx={fieldSx}>
                  <InputLabel>Assigned Sales Rep</InputLabel>
                  <Select
                    label="Assigned Sales Rep"
                    value={values.assignedRep}
                    onChange={(e) => setField("assignedRep", e.target.value)}
                  >
                    {SALES_REPS.map((rep) => (
                      <MenuItem key={rep.id} value={rep.id}>
                        {rep.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Estimated Revenue"
                  type="number"
                  value={values.manualEstimatedRevenue}
                  onChange={(e) => setField("manualEstimatedRevenue", e.target.value)}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  sx={fieldSx}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Next Follow-up"
                  type="date"
                  value={values.nextFollowUpDate}
                  onChange={(e) => setField("nextFollowUpDate", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={fieldSx}
                />
              </Grid>
            </Grid>
          </FormSection>
        );

      case 4:
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <FormSection icon={NotebookPen} title="Additional Notes">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Customer Requirements / Vision"
                    multiline
                    minRows={3}
                    value={values.customerRequirements}
                    onChange={(e) => setField("customerRequirements", e.target.value)}
                    placeholder="Enter notes from the customer about what they want..."
                    sx={fieldSx}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Internal Notes"
                    multiline
                    minRows={2}
                    value={values.internalNotes}
                    onChange={(e) => setField("internalNotes", e.target.value)}
                    placeholder="Private notes for the team..."
                    sx={{
                      ...fieldSx,
                      "& .MuiOutlinedInput-root": {
                        ...fieldSx["& .MuiOutlinedInput-root"],
                        bgcolor: "#FFFBEB",
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </FormSection>

            <FormSection icon={Paperclip} title="Attachments">
              <Box
                component="label"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  px: 3,
                  py: 4,
                  border: "2px dashed #CBD5E1",
                  borderRadius: 2,
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: "#F8FAFC" },
                }}
              >
                <input
                  type="file"
                  multiple
                  hidden
                  onChange={handleFileChange}
                  accept="image/*,.pdf,.doc,.docx"
                />
                <Box sx={{ textAlign: "center" }}>
                  <Upload size={28} color="#94A3B8" style={{ marginBottom: 8 }} />
                  <Typography variant="body2" color="text.secondary">
                    <Box component="span" sx={{ color: "#2563EB", fontWeight: 500 }}>
                      Upload a file
                    </Box>{" "}
                    or drag and drop
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Site photos, HOA documents, or property maps up to 10MB
                  </Typography>
                  {attachmentNames.length > 0 && (
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {attachmentNames.join(", ")}
                    </Typography>
                  )}
                </Box>
              </Box>
            </FormSection>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Box
        sx={{
          bgcolor: "#1E293B",
          color: "#fff",
          px: 3,
          py: 2.5,
          mx: -3,
          mt: -1,
          mb: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            New Project Lead
          </Typography>
          <Typography variant="body2" sx={{ color: "#CBD5E1", mt: 0.5 }}>
            Enter client and project details to create a new pipeline entry.
          </Typography>
        </Box>
        <ClipboardList size={36} color="#94A3B8" />
      </Box>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 280 }}>{renderStepContent()}</Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column-reverse", sm: "row" },
          justifyContent: "space-between",
          gap: 1.5,
          mt: 3,
          pt: 2,
          borderTop: "1px solid #E2E8F0",
        }}
      >
        <Button variant="outlined" onClick={onCancel} sx={{ borderRadius: 2 }}>
          Cancel
        </Button>
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          {activeStep > 0 && (
            <Button variant="outlined" onClick={handleBack} sx={{ borderRadius: 2 }}>
              Back
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={handleSaveDraft}
            sx={{
              borderRadius: 2,
              color: "#1D4ED8",
              borderColor: "#BFDBFE",
              bgcolor: "#EFF6FF",
              "&:hover": { bgcolor: "#DBEAFE" },
            }}
          >
            Save as Draft
          </Button>
          {activeStep < STEPS.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ borderRadius: 2, bgcolor: "#2563EB" }}
            >
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<CheckCircle size={18} />}
              sx={{ borderRadius: 2, bgcolor: "#2563EB" }}
            >
              Create Lead
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
