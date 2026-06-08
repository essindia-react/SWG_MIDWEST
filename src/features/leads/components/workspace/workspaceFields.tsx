import {
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Checkbox,
} from "@mui/material";

export const fieldProps = {
  size: "small" as const,
  variant: "outlined" as const,
  fullWidth: true,
};

interface FieldProps<T extends string> {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly T[];
  disabled?: boolean;
  required?: boolean;
}

interface LabeledOption {
  value: string;
  label: string;
}

interface LabeledSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly LabeledOption[];
  disabled?: boolean;
  required?: boolean;
}

interface MultiSelectFieldProps<T extends string> {
  label: string;
  value: readonly T[];
  onChange: (value: T[]) => void;
  options: readonly T[];
  disabled?: boolean;
  required?: boolean;
}

interface ToggleFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
}: FieldProps<T>) {
  const selectLabel = label || " ";
  return (
    <FormControl {...fieldProps} required={required} disabled={disabled}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        label={label ? selectLabel : undefined}
        displayEmpty={!label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <MenuItem key={o} value={o}>
            {o}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function LabeledSelectField({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
}: LabeledSelectFieldProps) {
  return (
    <FormControl {...fieldProps} required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function MultiSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  disabled,
  required,
}: MultiSelectFieldProps<T>) {
  return (
    <FormControl {...fieldProps} required={required} disabled={disabled}>
      <InputLabel>{label}</InputLabel>
      <Select
        multiple
        label={label}
        value={[...value]}
        onChange={(e) => onChange(e.target.value as T[])}
        renderValue={(selected) => selected.join(", ")}
      >
        {options.map((o) => (
          <MenuItem key={o} value={o}>
            <Checkbox size="small" checked={value.includes(o)} sx={{ p: 0, mr: 1 }} />
            {o}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export function ToggleField({ label, value, onChange, disabled }: ToggleFieldProps) {
  return (
    <FormControl disabled={disabled}>
      <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
        {label}
      </FormLabel>
      <RadioGroup
        row
        value={value ? "yes" : "no"}
        onChange={(e) => onChange(e.target.value === "yes")}
      >
        <FormControlLabel
          value="yes"
          control={<Radio size="small" />}
          label="Yes"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" } }}
        />
        <FormControlLabel
          value="no"
          control={<Radio size="small" />}
          label="No"
          sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" } }}
        />
      </RadioGroup>
    </FormControl>
  );
}

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  multiline?: boolean;
  minRows?: number;
}

export function TextFieldInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  disabled,
  required,
  multiline,
  minRows,
}: TextFieldProps) {
  return (
    <TextField
      {...fieldProps}
      label={label || undefined}
      placeholder={placeholder}
      type={type}
      value={value}
      disabled={disabled}
      required={required}
      multiline={multiline}
      minRows={minRows}
      onChange={(e) => onChange(e.target.value)}
      InputLabelProps={type === "date" || type === "time" ? { shrink: true } : undefined}
    />
  );
}

interface RadioFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}

export function RadioField({ label, name, value, onChange, options }: RadioFieldProps) {
  return (
    <FormControl>
      <FormLabel sx={{ fontSize: "0.75rem", fontWeight: 600, color: "text.secondary", mb: 0.5 }}>
        {label}
      </FormLabel>
      <RadioGroup row name={name} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <FormControlLabel
            key={o.value}
            value={o.value}
            control={<Radio size="small" />}
            label={o.label}
            sx={{ "& .MuiFormControlLabel-label": { fontSize: "0.8125rem" } }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

interface CheckboxCardProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function CheckboxCard({ label, checked, onChange }: CheckboxCardProps) {
  return (
    <Grid
      size={{ xs: 6, md: 3 }}
      sx={{
        p: 2,
        border: 1,
        borderColor: "divider",
        borderRadius: 2,
        bgcolor: "grey.50",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        "&:hover": { bgcolor: "background.paper", boxShadow: 1 },
        transition: "all 0.2s",
      }}
    >
      <Checkbox
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        sx={{ p: 0 }}
      />
      <FormLabel sx={{ fontSize: "0.8125rem", fontWeight: 500, color: "text.primary" }}>
        {label}
      </FormLabel>
    </Grid>
  );
}
