import { DUMMY_LEADS } from "../data/dummyLeads";
import type { Lead } from "../types/lead";

export const USER_LEADS_STORAGE_KEY = "swg-user-leads";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface UserLeadsCache {
  expiresAt: number;
  leads: Lead[];
}

const DUMMY_LEAD_IDS = new Set(DUMMY_LEADS.map((lead) => lead.id));

export function isUserAddedLead(lead: Lead): boolean {
  return !DUMMY_LEAD_IDS.has(lead.id);
}

export function extractUserLeads(leads: Lead[]): Lead[] {
  return leads.filter(isUserAddedLead);
}

export function loadUserLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(USER_LEADS_STORAGE_KEY);
    if (!raw) return [];

    const cache = JSON.parse(raw) as UserLeadsCache;
    if (Date.now() > cache.expiresAt) {
      localStorage.removeItem(USER_LEADS_STORAGE_KEY);
      return [];
    }

    return cache.leads;
  } catch {
    localStorage.removeItem(USER_LEADS_STORAGE_KEY);
    return [];
  }
}

export function saveUserLeads(leads: Lead[]): void {
  const userLeads = extractUserLeads(leads);
  if (userLeads.length === 0) {
    localStorage.removeItem(USER_LEADS_STORAGE_KEY);
    return;
  }

  const cache: UserLeadsCache = {
    expiresAt: Date.now() + TTL_MS,
    leads: userLeads,
  };
  localStorage.setItem(USER_LEADS_STORAGE_KEY, JSON.stringify(cache));
}

export function mergeLeadsWithStored(dummyLeads: Lead[]): Lead[] {
  const stored = loadUserLeads();
  const dummyIds = new Set(dummyLeads.map((lead) => lead.id));
  const uniqueStored = stored.filter((lead) => !dummyIds.has(lead.id));
  return [...uniqueStored, ...dummyLeads];
}
