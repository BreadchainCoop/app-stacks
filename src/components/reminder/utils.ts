import { CalendarEvent, CalendarProvider, RecurrenceRule } from "./interfaces";

export const RECURRENCE_UNSUPPORTED: CalendarProvider[] = ["outlook", "yahoo"];

function resolveEndTime(event: CalendarEvent): Date {
  if (event.endTime) return event.endTime;
  const end = new Date(event.startTime);
  end.setHours(end.getHours() + 1);
  return end;
}

function formatDateCompact(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Builds an RRULE string from a RecurrenceRule.
 * e.g. "RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=MO,WE"
 */
function buildRRule(rule: RecurrenceRule): string {
  const parts: string[] = [`FREQ=${rule.frequency}`];

  if (rule.interval && rule.interval > 1) {
    parts.push(`INTERVAL=${rule.interval}`);
  }
  if (rule.byDay && rule.byDay.length > 0) {
    parts.push(`BYDAY=${rule.byDay.join(",")}`);
  }
  if (rule.until) {
    parts.push(`UNTIL=${formatDateCompact(rule.until)}`);
  } else if (rule.count) {
    parts.push(`COUNT=${rule.count}`);
  }

  return `RRULE:${parts.join(";")}`;
}

// ─────────────────────────────────────────────
// 1. Google Calendar
//    Supports recurrence via `recur` param
// ─────────────────────────────────────────────
export function googleCalendarUrl(event: CalendarEvent): string {
  const endTime = resolveEndTime(event);

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    details: event.description,
    location: event.location ?? "",
    dates: `${formatDateCompact(event.startTime)}/${formatDateCompact(endTime)}`,
  });

  if (event.recurrence) {
    // Google expects the full RRULE string as the `recur` param value
    params.set("recur", buildRRule(event.recurrence));
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// ─────────────────────────────────────────────
// 2. ICS File Download
//    Full RRULE support via the iCal spec
// ─────────────────────────────────────────────
export function downloadICS(event: CalendarEvent): void {
  const endTime = resolveEndTime(event);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//YourApp//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${Date.now()}@yourapp.com`,
    `DTSTAMP:${formatDateCompact(new Date())}`,
    `DTSTART:${formatDateCompact(event.startTime)}`,
    `DTEND:${formatDateCompact(endTime)}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description}`,
    `LOCATION:${event.location ?? ""}`,
  ];

  if (event.recurrence) {
    lines.push(buildRRule(event.recurrence));
  }

  lines.push(
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${event.title}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR"
  );

  const blob = new Blob([lines.join("\r\n")], {
    type: "text/calendar;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${event.fileName || "reminder"}.ics`;
  anchor.click();

  URL.revokeObjectURL(url);
}

export function outlookUrl(event: CalendarEvent): void {
  if (event.recurrence) {
    console.warn(
      "[addToOutlook] Outlook's deep-link does not support recurrence params. " +
        "The event will open without recurrence — the user must set it manually."
    );
  }

  const endTime = resolveEndTime(event);

  // Web fallback
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    body: event.description || "",
    startdt: formatDateISO(event.startTime),
    enddt: formatDateISO(endTime),
    location: event.location ?? "",
  });

  const webUrl = `https://outlook.cloud.microsoft/calendar/0/deeplink/compose?${params.toString()}`;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);

  if (isIOS || /android/i.test(navigator.userAgent)) {
    const title = encodeURIComponent(event.title);
    const start = encodeURIComponent(event.startTime.toISOString());
    const end = encodeURIComponent(endTime.toISOString());
    const location = event.location
      ? `&location=${encodeURIComponent(event.location)}`
      : "";
    const desc = event.description
      ? `&body=${encodeURIComponent(event.description)}`
      : "";

    const mobileUrl = `ms-outlook://events/new?title=${title}&start=${start}&end=${end}${location}${desc}`;

    // Try app first
    window.location.href = mobileUrl;

    // Fallback to web after delay if app doesn't open
    setTimeout(() => {
      window.open(webUrl, "_blank", "noopener,noreferrer");
    }, 1500);
  } else {
    window.open(webUrl, "_blank", "noopener,noreferrer");
  }
}

// ─────────────────────────────────────────────
// 4. Yahoo Calendar
//    No recurrence support in URL scheme.
// ─────────────────────────────────────────────
function getYahooDuration(startTime: Date, endTime: Date): string {
  const durationMs = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(durationMs / 3_600_000);
  const mins = Math.floor((durationMs % 3_600_000) / 60_000);
  return `${String(hours).padStart(2, "0")}${String(mins).padStart(2, "0")}`;
}

export function yahooCalendarUrl(event: CalendarEvent): string {
  if (event.recurrence) {
    console.warn(
      "[yahooCalendarUrl] Yahoo Calendar does not support recurrence via URL. " +
        "The event will be created as a one-time event."
    );
  }

  const endTime = resolveEndTime(event);

  const params = new URLSearchParams({
    v: "60",
    title: event.title,
    desc: event.description,
    st: formatDateCompact(event.startTime),
    dur: getYahooDuration(event.startTime, endTime),
    in_loc: event.location ?? "",
  });

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

export function addToCalendar(
  provider: CalendarProvider,
  event: CalendarEvent
): void {
  switch (provider) {
    case "google":
      window.open(googleCalendarUrl(event), "_blank", "noopener,noreferrer");
      break;
    case "ics":
      downloadICS(event);
      break;
    case "outlook":
      outlookUrl(event);
      break;
    case "yahoo":
      window.open(yahooCalendarUrl(event), "_blank", "noopener,noreferrer");
      break;
    default:
      provider satisfies never;
  }
}
