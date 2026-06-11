import type {
  BudgetRange,
  ExistingSurface,
  FormPipelineStage,
  LeadPriority,
  LeadSource,
  LeadStatus,
  OhioRegion,
  ProjectSubtype,
  ProjectType,
  PropertyType,
  TurfStyle,
} from "../types/lead";

export interface SalesRep {
  id: string;
  name: string;
  initials: string;
  color: string;
}

export const SALES_REPS: SalesRep[] = [
  { id: "maria-s", name: "Maria S.", initials: "MS", color: "#2E7D32" },
  { id: "emily-c", name: "Emily C.", initials: "EC", color: "#7C3AED" },
  { id: "chris-w", name: "Chris W.", initials: "CW", color: "#D97706" },
  { id: "alex-j", name: "Alex J.", initials: "AJ", color: "#0284C7" },
];

export const LEAD_SOURCES: { value: LeadSource; label: string }[] = [
  { value: "web-form", label: "Website Form" },
  { value: "google-ads", label: "Google Ads" },
  { value: "referral", label: "Customer Referral" },
  { value: "social", label: "Social Media" },
  { value: "phone", label: "Direct Call" },
  { value: "walk-in", label: "Walk-in" },
];

export const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "landscaping", label: "General Landscaping" },
  { value: "artificial-turf", label: "Artificial Turf Installation" },
  { value: "putting-green", label: "Golf / Putting Green" },
  { value: "pet-turf", label: "Pet & Dog Turf" },
  { value: "hardscape", label: "Hardscaping / Paving" },
  { value: "playground", label: "Playground Turf" },
  { value: "sports-turf", label: "Sports Turf" },
  { value: "maintenance", label: "Maintenance Contract" },
  { value: "tee-line", label: "Synthetic Tee Lines" },
  { value: "other", label: "Other" },
];

export const PROJECT_SUBTYPES: { value: ProjectSubtype; label: string }[] = [
  { value: "outdoor", label: "Outdoor" },
  { value: "indoor", label: "Indoor" },
  { value: "basement", label: "Basement" },
  { value: "commercial", label: "Commercial" },
  { value: "residential", label: "Residential" },
];

export const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "industrial", label: "Industrial" },
  { value: "municipal", label: "Municipal / Public" },
];

export const EXISTING_SURFACES: { value: ExistingSurface; label: string }[] = [
  { value: "grass", label: "Natural Grass" },
  { value: "dirt", label: "Bare Dirt / Soil" },
  { value: "concrete", label: "Concrete / Pavement" },
  { value: "weeds", label: "Heavy Weeds / Brush" },
  { value: "other", label: "Other" },
];

export const TURF_STYLES: { value: TurfStyle; label: string }[] = [
  { value: "pet-friendly", label: "Pet Friendly" },
  { value: "putting-green", label: "Putting Green" },
  { value: "landscape-premium", label: "Landscape Premium" },
];

export const BUDGET_RANGES: { value: BudgetRange; label: string }[] = [
  { value: "under-10k", label: "Under $10,000" },
  { value: "10k-25k", label: "$10,000 – $25,000" },
  { value: "25k-50k", label: "$25,000 – $50,000" },
  { value: "50k-100k", label: "$50,000 – $100,000" },
  { value: "over-100k", label: "Over $100,000" },
];

export const LEAD_PRIORITIES: { value: LeadPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export const FORM_PIPELINE_STAGES: {
  value: FormPipelineStage;
  label: string;
}[] = [
  { value: "new", label: "New Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "meeting_scheduled", label: "Site Visit Scheduled" },
  { value: "quoting", label: "Quoting" },
];

export const US_STATES = [
  { value: "OH", label: "Ohio" },
  { value: "KY", label: "Kentucky" },
  { value: "IN", label: "Indiana" },
  { value: "PA", label: "Pennsylvania" },
  { value: "MI", label: "Michigan" },
  { value: "WV", label: "West Virginia" },
];

export const ALL_US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export const OHIO_REGIONS: { value: OhioRegion; label: string }[] = [
  { value: "columbus", label: "Columbus" },
  { value: "cleveland", label: "Cleveland" },
  { value: "cincinnati", label: "Cincinnati" },
  { value: "dayton", label: "Dayton" },
  { value: "akron", label: "Akron" },
  { value: "toledo", label: "Toledo" },
  { value: "parma", label: "Parma" },
  { value: "other-ohio", label: "Other Ohio" },
];

export const LEAD_STATUS_CONFIG: Record<
  LeadStatus,
  { label: string; color: string; bg: string }
> = {
  new: { label: "New Inquiry", color: "#64748B", bg: "#F8FAFC" },
  site_visit: { label: "Site Visit", color: "#D97706", bg: "#FFFBEB" },
  design: { label: "Design", color: "#0284C7", bg: "#EFF6FF" },
  estimate_sent: { label: "Estimation", color: "#EA580C", bg: "#FFF7ED" },
  proposal_sent: { label: "Proposal Sent", color: "#0284C7", bg: "#EFF6FF" },
  won: { label: "Won", color: "#16A34A", bg: "#F0FDF4" },
  lost: { label: "Lost", color: "#94A3B8", bg: "#F8FAFC" },
};

const LEGACY_LEAD_STATUS_MAP: Record<string, LeadStatus> = {
  contacted: "design",
  consulted: "site_visit",
  quoted: "estimate_sent",
  nurturing: "new",
};

export function normalizeLeadStatus(status: string): LeadStatus {
  if (status in LEAD_STATUS_CONFIG) {
    return status as LeadStatus;
  }
  return LEGACY_LEAD_STATUS_MAP[status] ?? "new";
}

export const PRIORITY_CONFIG: Record<
  LeadPriority,
  { label: string; color: string; bg: string; border: string }
> = {
  urgent: {
    label: "Urgent",
    color: "#991B1B",
    bg: "#FEE2E2",
    border: "#FECACA",
  },
  high: {
    label: "High",
    color: "#B45309",
    bg: "#FEF3C7",
    border: "#FDE68A",
  },
  medium: {
    label: "Medium",
    color: "#A16207",
    bg: "#FEF9C3",
    border: "#FEF08A",
  },
  low: {
    label: "Low",
    color: "#047857",
    bg: "#D1FAE5",
    border: "#A7F3D0",
  },
};

export const FORM_STAGE_TO_STATUS: Record<FormPipelineStage, LeadStatus> = {
  new: "new",
  contacted: "design",
  meeting_scheduled: "site_visit",
  quoting: "estimate_sent",
};

export const DEFAULT_LEAD_SOURCE: LeadSource = "web-form";
export const DEFAULT_ASSIGNED_REP = "maria-s";
export const DEFAULT_OHIO_REGION: OhioRegion = "columbus";

export const TURF_PROJECT_TYPES: ProjectType[] = [
  "artificial-turf",
  "pet-turf",
  "putting-green",
  "playground",
  "sports-turf",
];
