import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getRepById, getLeadFullName } from "../lib/leadHelpers";
import {
  loadCalendarEvents,
  saveCalendarEvents,
} from "../lib/calendarStorage";
import type { CalendarEvent } from "../types/calendar";
import type { Lead } from "../types/lead";
import { useLeads } from "./useLeads";

interface CalendarEventsContextValue {
  events: CalendarEvent[];
  addEventFromLead: (lead: Lead) => CalendarEvent | null;
}

const CalendarEventsContext = createContext<CalendarEventsContextValue | null>(
  null
);

function parseVisitTime(time: string): number {
  if (!time) return 10;
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours)) return 10;
  return hours + (minutes && !Number.isNaN(minutes) ? minutes / 60 : 0);
}

export function createSiteVisitEvent(lead: Lead): CalendarEvent | null {
  const visitDate =
    lead.workflowData?.visitDate ||
    lead.workflowData?.siteVisitScheduledDate;
  if (!visitDate) return null;

  const rep = getRepById(lead.assignedRep);
  const customerName = getLeadFullName(lead);

  return {
    id: `cal-${lead.id}`,
    title: `Site Visit — ${customerName}`,
    lead: customerName,
    leadId: lead.id,
    rep: lead.workflowData?.assignedSalesRepName ?? rep.name,
    repInitials: rep.initials,
    type: "visit",
    date: visitDate,
    startHour: parseVisitTime(lead.workflowData?.visitTime ?? ""),
    duration: 1.5,
    color: "#D97706",
    bg: "#FFF7ED",
  };
}

function buildEventsFromLeads(leads: Lead[]): CalendarEvent[] {
  return leads
    .map(createSiteVisitEvent)
    .filter((event): event is CalendarEvent => event !== null);
}

export function CalendarEventsProvider({ children }: { children: ReactNode }) {
  const { leads } = useLeads();
  const [events, setEvents] = useState<CalendarEvent[]>(() =>
    loadCalendarEvents()
  );

  useEffect(() => {
    const fromLeads = buildEventsFromLeads(leads);
    setEvents(fromLeads);
  }, [leads]);

  useEffect(() => {
    saveCalendarEvents(events);
  }, [events]);

  const addEventFromLead = useCallback((lead: Lead) => {
    const event = createSiteVisitEvent(lead);
    if (!event) return null;

    setEvents((prev) => {
      const withoutDuplicate = prev.filter((e) => e.leadId !== lead.id);
      return [...withoutDuplicate, event];
    });
    return event;
  }, []);

  const value = useMemo(
    () => ({ events, addEventFromLead }),
    [events, addEventFromLead]
  );

  return (
    <CalendarEventsContext.Provider value={value}>
      {children}
    </CalendarEventsContext.Provider>
  );
}

export function useCalendarEvents(): CalendarEventsContextValue {
  const context = useContext(CalendarEventsContext);
  if (!context) {
    throw new Error(
      "useCalendarEvents must be used within a CalendarEventsProvider"
    );
  }
  return context;
}
