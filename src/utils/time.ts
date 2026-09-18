export function formatRelativeTime(
  date: Date | string | number,
  now: Date = new Date()
): string {
  // const now = new Date();
  const then = typeof date === "object" ? date : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 0) return "just now";

  if (diffInSeconds < 60)
    return diffInSeconds === 1 ? "1 sec ago" : `${diffInSeconds} secs ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return diffInMonths === 1 ? "1 month ago" : `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return diffInYears === 1 ? "1 year ago" : `${diffInYears} years ago`;
}

/**
 * Parse a `YYYY-MM-DD` value from a `<input type="date">` as local midnight.
 * `new Date("2026-08-15")` would parse as UTC midnight, which lands on the
 * previous day for anyone west of UTC.
 */
export const dateInputToMs = (value: string): number => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return NaN;

  return new Date(year, month - 1, day).getTime();
};

/**
 * The earliest date a user may pick as a deadline, as a `YYYY-MM-DD` value.
 * Midnight today has already passed, so the first valid deadline is tomorrow.
 */
export const earliestDeadlineDate = (): string => {
  const date = new Date();
  date.setDate(date.getDate() + 1);

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

export const formatShortDate = (date: Date | string | number): string => {
  date = typeof date === "object" ? date : new Date(date);

  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const month = date.toLocaleString("en", { month: "short" });
  const year = date.getFullYear();

  return `${day} ${month}, ${year}`;
};
