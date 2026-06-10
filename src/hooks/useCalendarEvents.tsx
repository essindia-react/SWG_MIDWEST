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
import { EVENT_TYPE_CONFIG } from "../features/calendar/constants/calendarConstants";
import type { CalendarEventFormData } from "../features/calendar/components/CalendarEventForm";
import type { CalendarEvent } from "../types/calendar";
import type { Lead } from "../types/lead";
import { useLeads } from "./useLeads";

interface CalendarEventsContextValue {
  events: CalendarEvent[];
  addEventFromLead: (lead: Lead) => CalendarEvent | null;
  addManualEvent: (data: CalendarEventFormData) => CalendarEvent;
}

function isManualEvent(event: CalendarEvent): boolean {
  return event.id.startsWith("manual-");
}

function parseTimeToHour(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  if (Number.isNaN(hours)) return 9;
  return hours + (minutes && !Number.isNaN(minutes) ? minutes / 60 : 0);
}

export function createManualEvent(data: CalendarEventFormData): CalendarEvent {
  const id = `manual-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const config = EVENT_TYPE_CONFIG[data.type];
  const startHour = parseTimeToHour(data.startTime);
  const endHour = parseTimeToHour(data.endTime);
  const duration = Math.max(0.5, endHour - startHour);

  return {
    id,
    title: config.label,
    lead: "",
    leadId: id,
    rep: "—",
    repInitials: "—",
    type: data.type,
    date: data.date,
    startHour,
    duration,
    color: config.color,
    bg: config.bg,
  };
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
    setEvents((prev) => {
      const manualEvents = prev.filter(isManualEvent);
      return [...fromLeads, ...manualEvents];
    });
  }, [leads]);

  useEffect(() => {
    saveCalendarEvents(events);
  }, [events]);

  const addEventFromLead = useCallback((lead: Lead) => {
    const event = createSiteVisitEvent(lead);
    if (!event) return null;

    setEvents((prev) => {
      const manualEvents = prev.filter(isManualEvent);
      const leadEvents = prev.filter((e) => !isManualEvent(e) && e.leadId !== lead.id);
      return [...leadEvents, event, ...manualEvents];
    });
    return event;
  }, []);

  const addManualEvent = useCallback((data: CalendarEventFormData) => {
    const event = createManualEvent(data);
    setEvents((prev) => [...prev, event]);
    return event;
  }, []);

  const value = useMemo(
    () => ({ events, addEventFromLead, addManualEvent }),
    [events, addEventFromLead, addManualEvent]
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
