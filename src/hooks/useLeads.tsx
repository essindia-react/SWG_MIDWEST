import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DUMMY_LEADS } from "../data/dummyLeads";
import { FORM_STAGE_TO_STATUS } from "../lib/constants";
import {
  estimateLeadValue,
  pipelineStageToLeadStatus,
  type PipelineStage,
} from "../lib/leadHelpers";
import { applyLeadDefaults, generateLeadNumber } from "../lib/leadDefaults";
import {
  mergeLeadsWithStored,
  saveUserLeads,
} from "../lib/leadStorage";
import { zipToOhioRegion } from "../lib/zipToRegion";
import type { Lead, LeadFormInput, LeadStatus } from "../types/lead";

interface LeadsContextValue {
  leads: Lead[];
  userAddedLeads: Lead[];
  addLead: (input: LeadFormInput) => Lead;
  updateLeadStatus: (id: string, status: LeadStatus) => void;
  updateLeadPipelineStage: (id: string, stage: PipelineStage) => void;
  getLeadById: (id: string) => Lead | undefined;
}

const LeadsContext = createContext<LeadsContextValue | null>(null);

function createLeadRecord(input: LeadFormInput): Lead {
  const now = new Date().toISOString();
  const ohioRegion = zipToOhioRegion(input.zipCode);
  const estimatedValue =
    input.manualEstimatedRevenue ??
    estimateLeadValue(
      input.projectType,
      input.squareFootageEstimate,
      input.budgetRange
    );
  const status =
    input.status ??
    (input.formPipelineStage
      ? FORM_STAGE_TO_STATUS[input.formPipelineStage]
      : "new");

  const { manualEstimatedRevenue: _, formPipelineStage: __, ...leadFields } =
    input;

  return applyLeadDefaults({
    ...leadFields,
    id: `lead-${Date.now()}`,
    leadNumber: generateLeadNumber(),
    ohioRegion,
    estimatedValue,
    status,
    notes: input.customerRequirements ?? input.notes,
    createdAt: now,
    updatedAt: now,
  });
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(() =>
    mergeLeadsWithStored(DUMMY_LEADS).map(applyLeadDefaults)
  );

  useEffect(() => {
    saveUserLeads(leads);
  }, [leads]);

  const userAddedLeads = useMemo(
    () =>
      leads.filter(
        (lead) => !DUMMY_LEADS.some((dummy) => dummy.id === lead.id)
      ),
    [leads]
  );

  const addLead = useCallback((input: LeadFormInput) => {
    const newLead = createLeadRecord(input);
    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  }, []);

  const updateLeadStatus = useCallback((id: string, status: LeadStatus) => {
    const now = new Date().toISOString();
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status, updatedAt: now } : lead
      )
    );
  }, []);

  const updateLeadPipelineStage = useCallback(
    (id: string, stage: PipelineStage) => {
      updateLeadStatus(id, pipelineStageToLeadStatus(stage));
    },
    [updateLeadStatus]
  );

  const getLeadById = useCallback(
    (id: string) => leads.find((lead) => lead.id === id),
    [leads]
  );

  const value = useMemo(
    () => ({
      leads,
      userAddedLeads,
      addLead,
      updateLeadStatus,
      updateLeadPipelineStage,
      getLeadById,
    }),
    [
      leads,
      userAddedLeads,
      addLead,
      updateLeadStatus,
      updateLeadPipelineStage,
      getLeadById,
    ]
  );

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
}

export function useLeads(): LeadsContextValue {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
}
