export type RecurrenceFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type WeekDay = "MO" | "TU" | "WE" | "TH" | "FR" | "SA" | "SU";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g. 2 = every 2 weeks
  count?: number; // number of occurrences
  until?: Date; // end date (mutually exclusive with count)
  byDay?: WeekDay[]; // e.g. ["MO", "WE", "FR"] for weekly on those days
}

export interface CalendarEvent {
  title: string;
  description: string;
  startTime: Date;
  endTime?: Date; // optional — defaults to startTime + 1 hour
  location?: string;
  recurrence?: RecurrenceRule;
  fileName?: string;
}

export type CalendarProvider = "google" | "ics" | "outlook" | "yahoo";
