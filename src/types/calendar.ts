export type CalendarEventType = "visit" | "call" | "consultation" | "installation";

export interface CalendarEvent {
  id: string;
  title: string;
  lead: string;
  leadId: string;
  rep: string;
  repInitials: string;
  type: CalendarEventType;
  date: string;
  startHour: number;
  duration: number;
  color: string;
  bg: string;
}
