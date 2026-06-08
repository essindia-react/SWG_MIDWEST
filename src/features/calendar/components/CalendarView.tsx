import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  MapPin,
  Phone,
  Users,
  Calendar,
} from "lucide-react";
import { useCalendarEvents } from "../../../hooks/useCalendarEvents";
import {
  isSameLocalDay,
  parseLocalDateString,
} from "../../../lib/dateHelpers";
import type { CalendarEvent } from "../../../types/calendar";

type CalView = "month" | "week" | "day";

const typeIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  visit: MapPin,
  call: Phone,
  consultation: Users,
  installation: Calendar,
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const fullDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const repColors: Record<string, string> = {
  MS: "#2E7D32",
  AJ: "#0284C7",
  EC: "#7C3AED",
  CW: "#D97706",
};

interface DisplayEvent extends CalendarEvent {
  day: number;
}

function toDisplayEvents(events: CalendarEvent[], year: number, month: number): DisplayEvent[] {
  return events
    .map((event) => {
      const date = parseLocalDateString(event.date);
      if (date.getFullYear() !== year || date.getMonth() !== month) return null;
      return { ...event, day: date.getDate() };
    })
    .filter((event): event is DisplayEvent => event !== null);
}

function getWeekRange(date: Date) {
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - ((dayOfWeek + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
  return days;
}

function formatWeekLabel(days: Date[]) {
  const start = days[0];
  const end = days[6];
  const startLabel = `${monthNames[start.getMonth()].slice(0, 3)} ${start.getDate()}`;
  const endLabel = `${monthNames[end.getMonth()].slice(0, 3)} ${end.getDate()}, ${end.getFullYear()}`;
  return `${startLabel}–${endLabel}`;
}

export function CalendarView() {
  const { events } = useCalendarEvents();
  const [view, setView] = useState<CalView>("week");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [focusedEventDate, setFocusedEventDate] = useState(false);

  useEffect(() => {
    if (!focusedEventDate && events.length > 0) {
      const latest = events[events.length - 1];
      setCurrentDate(parseLocalDateString(latest.date));
      setFocusedEventDate(true);
    }
  }, [events, focusedEventDate]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const today = new Date();
  const todayDay = today.getDate();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const displayEvents = useMemo(
    () => toDisplayEvents(events, year, month),
    [events, year, month]
  );

  const weekDaysDisplay = useMemo(() => getWeekRange(currentDate), [currentDate]);
  const weekLabel = formatWeekLabel(weekDaysDisplay);

  const navigateMonth = (dir: 1 | -1) => {
    setCurrentDate(new Date(year, month + dir, 1));
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 7);

  const getEventsForDate = (date: Date): DisplayEvent[] => {
    return events
      .filter((event) => isSameLocalDay(parseLocalDateString(event.date), date))
      .map((event) => ({
        ...event,
        day: date.getDate(),
      }));
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div
        className="w-64 flex-shrink-0 border-r overflow-y-auto bg-white p-4"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => navigateMonth(-1)} className="p-1 rounded hover:bg-muted">
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-foreground" style={{ fontSize: "13px", fontWeight: 600 }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-1 rounded hover:bg-muted">
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0 mb-4">
          {weekDays.map((d) => (
            <div key={d} className="text-center py-1" style={{ fontSize: "10px", fontWeight: 600, color: "var(--muted-foreground)" }}>
              {d}
            </div>
          ))}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const hasEvent = displayEvents.some((e) => e.day === day);
            const isToday = isCurrentMonth && day === todayDay;
            return (
              <button
                key={day}
                className="flex flex-col items-center py-1 rounded-lg transition-colors hover:bg-muted"
                style={{
                  backgroundColor: isToday ? "var(--brand-green)" : "transparent",
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? "white" : "var(--foreground)",
                  }}
                >
                  {day}
                </span>
                {hasEvent && (
                  <div
                    className="w-1 h-1 rounded-full mt-0.5"
                    style={{ backgroundColor: isToday ? "rgba(255,255,255,0.8)" : "var(--brand-green)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t pt-4 space-y-2" style={{ borderColor: "var(--border)" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }} className="mb-2">
            Event Types
          </p>
          {[
            { type: "Site Visit", color: "#D97706", bg: "#FFF7ED" },
            { type: "Phone Call", color: "#0284C7", bg: "#EFF6FF" },
            { type: "Consultation", color: "#7C3AED", bg: "#F5F3FF" },
            { type: "Installation", color: "#16A34A", bg: "#F0FDF4" },
          ].map((item) => (
            <div key={item.type} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.color }} />
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>{item.type}</span>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 mt-4 space-y-2" style={{ borderColor: "var(--border)" }}>
          <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--muted-foreground)", textTransform: "uppercase", letterSpacing: "0.05em" }} className="mb-2">
            Sales Team
          </p>
          {[
            { name: "Maria S.", initials: "MS" },
            { name: "Alex J.", initials: "AJ" },
            { name: "Emily C.", initials: "EC" },
            { name: "Chris W.", initials: "CW" },
          ].map((rep) => (
            <div key={rep.name} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: repColors[rep.initials], fontSize: "9px", fontWeight: 700 }}
              >
                {rep.initials}
              </div>
              <span style={{ fontSize: "12px", color: "var(--foreground)" }}>{rep.name}</span>
            </div>
          ))}
        </div>

        {events.length === 0 && (
          <p className="mt-4 text-center" style={{ fontSize: "12px", color: "var(--muted-foreground)" }}>
            No scheduled events yet. Create a lead with a site visit to populate the calendar.
          </p>
        )}

        <button
          className="w-full flex items-center justify-center gap-2 mt-6 py-2.5 rounded-xl text-white transition-all"
          style={{ backgroundColor: "var(--brand-green)", fontSize: "13px" }}
        >
          <Plus className="w-4 h-4" />
          New Event
        </button>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 p-1 rounded-lg border bg-white" style={{ borderColor: "var(--border)" }}>
              {(["month", "week", "day"] as CalView[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-md capitalize transition-all"
                  style={{
                    fontSize: "13px",
                    fontWeight: view === v ? 600 : 400,
                    backgroundColor: view === v ? "var(--brand-green)" : "transparent",
                    color: view === v ? "white" : "var(--muted-foreground)",
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
            <button
              className="p-2 rounded-lg border hover:bg-muted"
              style={{ borderColor: "var(--border)" }}
              onClick={() => setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))}
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-foreground" style={{ fontSize: "14px", fontWeight: 600 }}>
              {weekLabel}
            </span>
            <button
              className="p-2 rounded-lg border hover:bg-muted"
              style={{ borderColor: "var(--border)" }}
              onClick={() => setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))}
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <button
            className="px-4 py-2 rounded-lg border hover:bg-muted"
            style={{ fontSize: "13px", borderColor: "var(--border)" }}
            onClick={() => setCurrentDate(new Date())}
          >
            Today
          </button>
        </div>

        {view === "week" && (
          <div className="flex-1 overflow-auto">
            <div className="flex min-w-full">
              <div className="w-16 flex-shrink-0 border-r" style={{ borderColor: "var(--border)" }}>
                <div className="h-14 border-b" style={{ borderColor: "var(--border)" }} />
                {hours.map((h) => (
                  <div
                    key={h}
                    className="h-16 border-b flex items-start justify-end pr-2 pt-1"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
                      {h > 12 ? `${h - 12}pm` : `${h}am`}
                    </span>
                  </div>
                ))}
              </div>

              {weekDaysDisplay.map((date) => {
                const dayEvents = getEventsForDate(date);
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div key={date.toISOString()} className="flex-1 border-r min-w-0" style={{ borderColor: "var(--border)" }}>
                    <div
                      className="h-14 border-b flex flex-col items-center justify-center"
                      style={{
                        borderColor: "var(--border)",
                        backgroundColor: isToday ? "var(--brand-light-green)" : "transparent",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: isToday ? "var(--brand-green)" : "var(--muted-foreground)",
                          fontWeight: isToday ? 700 : 400,
                        }}
                      >
                        {fullDays[date.getDay()].slice(0, 3).toUpperCase()}
                      </span>
                      <div
                        className="w-8 h-8 flex items-center justify-center rounded-full mt-0.5"
                        style={{
                          backgroundColor: isToday ? "var(--brand-green)" : "transparent",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "14px",
                            fontWeight: 700,
                            color: isToday ? "white" : "var(--foreground)",
                          }}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      {hours.map((h) => (
                        <div
                          key={h}
                          className="h-16 border-b"
                          style={{ borderColor: "var(--border)" }}
                        />
                      ))}

                      {dayEvents.map((event) => {
                        const top = (event.startHour - 7) * 64;
                        const height = event.duration * 64;
                        const TypeIcon = typeIcons[event.type];
                        return (
                          <div
                            key={event.id}
                            className="absolute left-1 right-1 rounded-lg px-2 py-1.5 cursor-pointer overflow-hidden border-l-2 transition-opacity hover:opacity-90"
                            style={{
                              top: `${top}px`,
                              height: `${height - 4}px`,
                              backgroundColor: event.bg,
                              borderLeftColor: event.color,
                            }}
                          >
                            <div className="flex items-center gap-1 mb-0.5">
                              <TypeIcon className="w-3 h-3 flex-shrink-0" style={{ color: event.color }} />
                              <p
                                className="truncate"
                                style={{ fontSize: "11px", fontWeight: 600, color: event.color }}
                              >
                                {event.title}
                              </p>
                            </div>
                            {height > 48 && (
                              <p className="truncate" style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
                                {event.lead}
                              </p>
                            )}
                            {height > 64 && (
                              <div className="flex items-center gap-1 mt-1">
                                <div
                                  className="w-4 h-4 rounded-full flex items-center justify-center text-white"
                                  style={{ backgroundColor: repColors[event.repInitials], fontSize: "8px", fontWeight: 700 }}
                                >
                                  {event.repInitials}
                                </div>
                                <span style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>{event.rep}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === "month" && (
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-7 gap-0 bg-white rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="text-center py-3 border-b"
                  style={{ fontSize: "12px", fontWeight: 600, color: "var(--muted-foreground)", borderColor: "var(--border)", backgroundColor: "#FAFAFA" }}
                >
                  {d}
                </div>
              ))}
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="h-32 border-b border-r" style={{ borderColor: "var(--border)", backgroundColor: "#FAFAFA" }} />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayEvents = displayEvents.filter((e) => e.day === day);
                const isToday = isCurrentMonth && day === todayDay;
                return (
                  <div
                    key={day}
                    className="h-32 border-b border-r p-2"
                    style={{
                      borderColor: "var(--border)",
                      backgroundColor: isToday ? "#F0FDF4" : "white",
                    }}
                  >
                    <div
                      className="w-6 h-6 flex items-center justify-center rounded-full mb-1"
                      style={{
                        backgroundColor: isToday ? "var(--brand-green)" : "transparent",
                      }}
                    >
                      <span style={{ fontSize: "12px", fontWeight: isToday ? 700 : 400, color: isToday ? "white" : "var(--foreground)" }}>
                        {day}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="truncate px-1.5 py-0.5 rounded"
                          style={{ fontSize: "10px", backgroundColor: e.bg, color: e.color, fontWeight: 500 }}
                        >
                          {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div style={{ fontSize: "10px", color: "var(--muted-foreground)" }}>
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
