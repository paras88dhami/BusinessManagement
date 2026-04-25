import { bikramSambat } from "@samirkoirala/bs-calendar-react/dist/index.esm.js";

export type CalendarDateParts = {
  year: number;
  month: number;
  day: number;
};

export const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const AD_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const BS_MONTH_NAMES = [
  "Baisakh",
  "Jestha",
  "Asadh",
  "Shrawan",
  "Bhadra",
  "Ashwin",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const padTwo = (value: number): string => String(value).padStart(2, "0");

export const formatDateParts = ({
  year,
  month,
  day,
}: CalendarDateParts): string => `${year}-${padTwo(month)}-${padTwo(day)}`;

export const parseDateOnly = (value: string): CalendarDateParts | null => {
  const normalizedValue = value.trim();

  if (!DATE_ONLY_PATTERN.test(normalizedValue)) {
    return null;
  }

  const [yearText, monthText, dayText] = normalizedValue.split("-");
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return null;
  }

  return { year, month, day };
};

export const isValidAdDateString = (value: string): boolean => {
  const parts = parseDateOnly(value);

  if (!parts) {
    return false;
  }

  const date = new Date(parts.year, parts.month - 1, parts.day);
  date.setHours(0, 0, 0, 0);

  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === parts.year &&
    date.getMonth() === parts.month - 1 &&
    date.getDate() === parts.day
  );
};

export const getTodayAdDateString = (): string => {
  const date = new Date();

  return formatDateParts({
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  });
};

export const getAdDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

export const getFirstWeekdayOfAdMonth = (year: number, month: number): number => {
  return new Date(year, month - 1, 1).getDay();
};

export const getBsDaysInMonth = (year: number, month: number): number | null => {
  try {
    return bikramSambat.daysInMonth(year, month);
  } catch {
    return null;
  }
};

export const adDateStringToBsParts = (
  value: string,
): CalendarDateParts | null => {
  if (!isValidAdDateString(value)) {
    return null;
  }

  try {
    return bikramSambat.toBik(value);
  } catch {
    return null;
  }
};

export const adDateStringToBsDateString = (value: string): string | null => {
  const bsParts = adDateStringToBsParts(value);

  return bsParts ? formatDateParts(bsParts) : null;
};

export const bsDatePartsToAdDateString = ({
  year,
  month,
  day,
}: CalendarDateParts): string | null => {
  const daysInMonth = getBsDaysInMonth(year, month);

  if (!daysInMonth || day < 1 || day > daysInMonth) {
    return null;
  }

  try {
    return formatDateParts(bikramSambat.toGreg(year, month, day));
  } catch {
    return null;
  }
};

export const bsDateStringToAdDateString = (value: string): string | null => {
  const parts = parseDateOnly(value);

  return parts ? bsDatePartsToAdDateString(parts) : null;
};

export const getFirstWeekdayOfBsMonth = (
  year: number,
  month: number,
): number | null => {
  const adDateString = bsDatePartsToAdDateString({ year, month, day: 1 });
  const adParts = adDateString ? parseDateOnly(adDateString) : null;

  if (!adParts) {
    return null;
  }

  return getFirstWeekdayOfAdMonth(adParts.year, adParts.month);
};

export const getTodayBsParts = (): CalendarDateParts | null => {
  return adDateStringToBsParts(getTodayAdDateString());
};

export const formatDualCalendarDateLabel = (value: string): string => {
  const bsDateString = adDateStringToBsDateString(value);

  if (!isValidAdDateString(value) || !bsDateString) {
    return "";
  }

  return `${value} AD / ${bsDateString} BS`;
};
