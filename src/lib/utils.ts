// src/lib/utils.ts
// Utility helpers
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function cn(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "d MMM yyyy HH:mm", { locale: tr });
}

export function upcomingWindow(days = 7) {
  const now = new Date();
  const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return { now, until };
}