import type { CalendarEvent } from "../types/calendar";

export const CALENDAR_STORAGE_KEY = "swg-calendar-events";

interface CalendarCache {
  version: number;
  events: CalendarEvent[];
}

export function loadCalendarEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) return [];
    const cache = JSON.parse(raw) as CalendarCache;
    return Array.isArray(cache.events) ? cache.events : [];
  } catch {
    localStorage.removeItem(CALENDAR_STORAGE_KEY);
    return [];
  }
}

export function saveCalendarEvents(events: CalendarEvent[]): void {
  const cache: CalendarCache = { version: 1, events };
  localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(cache));
}
