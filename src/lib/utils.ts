import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatDateRange(start: Date, end: Date) {
  const fmt = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const startStr = fmt.format(new Date(start));
  const endStr = fmt.format(new Date(end));
  if (startStr === endStr) {
    return startStr;
  }
  return `${startStr} – ${endStr}`;
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hour12: false,
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatTimeRange(start: Date, end: Date) {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

export function getHoursBetween(startHour: number, endHour: number): number[] {
  const hours = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }
  return hours;
}

export function timeToMinutes(date: Date): number {
  const d = new Date(date);
  return d.getHours() * 60 + d.getMinutes();
}

export function addMinutes(date: Date, minutes: number): Date {
  const d = new Date(date);
  d.setMinutes(d.getMinutes() + minutes);
  return d;
}

export function snapToInterval(date: Date, intervalMinutes: number): Date {
  const d = new Date(date);
  d.setMinutes(Math.round(d.getMinutes() / intervalMinutes) * intervalMinutes, 0, 0);
  return d;
}

export function toTimeInputValue(date: Date): string {
  const d = new Date(date);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Parses a `yyyy-MM-dd` form value as a LOCAL date. `new Date('2026-05-22')`
 * is UTC midnight, which lands on the 21st for anyone west of Greenwich.
 */
export function parseDateInput(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

export function setTimeOnDay(day: Date, timeValue: string): Date {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const d = new Date(day);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

export function sessionsOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return (
    new Date(aStart).getTime() < new Date(bEnd).getTime() &&
    new Date(bStart).getTime() < new Date(aEnd).getTime()
  );
}

export function getDaysBetween(start: Date, end: Date): Date[] {
  const a = new Date(start);
  a.setHours(0, 0, 0, 0);
  const b = new Date(end);
  b.setHours(0, 0, 0, 0);

  // An event whose dates got saved out of order must still render a usable range.
  const current = a <= b ? a : b;
  const last = a <= b ? b : a;

  const days = [];
  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
}

/**
 * Days the calendar should offer: the event's own range, plus any day a session
 * actually falls on. Sessions scheduled outside the event range stay reachable
 * instead of silently vanishing from the grid.
 */
export function getCalendarDays(start: Date, end: Date, sessionStarts: Date[]): Date[] {
  const byTime = new Map<number, Date>();

  for (const day of getDaysBetween(start, end)) {
    byTime.set(day.getTime(), day);
  }

  for (const sessionStart of sessionStarts) {
    const day = new Date(sessionStart);
    day.setHours(0, 0, 0, 0);
    if (!Number.isNaN(day.getTime())) {
      byTime.set(day.getTime(), day);
    }
  }

  return [...byTime.values()].sort((x, y) => x.getTime() - y.getTime());
}

export function isSameDay(a: Date, b: Date): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) {
    return 'just now';
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }
  return new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short' }).format(
    new Date(date),
  );
}
