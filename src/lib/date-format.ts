type DateInput = Date | number | string;

const INVALID_DATE = "Invalid date";

function toDate(value: DateInput): Date | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

// Fixed ASCII assembly avoids locale/ICU differences between Node and browsers.
// The ordering intentionally follows the project's en-US month/day/year display.
export function formatDateOnly(value: DateInput): string {
  const date = toDate(value);
  if (!date) {
    return INVALID_DATE;
  }

  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

export function formatDateTime(value: DateInput): string {
  const date = toDate(value);
  if (!date) {
    return INVALID_DATE;
  }

  const hours = date.getUTCHours();
  const displayHours = hours % 12 || 12;
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  const period = hours < 12 ? "AM" : "PM";

  return `${formatDateOnly(date)}, ${displayHours}:${minutes}:${seconds} ${period} UTC`;
}
