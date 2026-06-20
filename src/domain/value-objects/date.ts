import dayjs from "dayjs";

/** ISO date in local timezone: YYYY-MM-DD */
export type DateString = string & { readonly __brand: "DateString" };

export function toDateString(date: Date = new Date()): DateString {
  return dayjs(date).format("YYYY-MM-DD") as DateString;
}

export function subtractDays(date: DateString, days: number): DateString {
  return dayjs(date).subtract(days, "day").format("YYYY-MM-DD") as DateString;
}

export function addDays(date: DateString, days: number): DateString {
  return dayjs(date).add(days, "day").format("YYYY-MM-DD") as DateString;
}

export function isToday(date: DateString): boolean {
  return date === toDateString();
}
