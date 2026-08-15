import { describe, expect, it } from 'vitest';

import {
  addMinutes,
  formatDateRange,
  getCalendarDays,
  getDaysBetween,
  getInitials,
  parseDateInput,
  sessionsOverlap,
  setTimeOnDay,
  snapToInterval,
  timeAgo,
  toTimeInputValue,
} from '@/lib/utils';

describe('getInitials', () => {
  it('returns two initials from a full name', () => {
    expect(getInitials('Alice Chen')).toBe('AC');
  });

  it('returns one initial from a single name', () => {
    expect(getInitials('Alice')).toBe('A');
  });

  it('returns two initials from three-part name', () => {
    expect(getInitials('Alice Bob Chen')).toBe('AB');
  });

  it('uppercases lowercase input', () => {
    expect(getInitials('alice chen')).toBe('AC');
  });

  it('handles single character name', () => {
    expect(getInitials('A')).toBe('A');
  });
});

describe('formatDateRange', () => {
  it('returns single date when start and end are same', () => {
    const date = new Date('2026-06-15');
    expect(formatDateRange(date, date)).toBe(formatDateRange(date, date));
  });

  it('returns range when dates differ', () => {
    const start = new Date('2026-06-15');
    const end = new Date('2026-06-17');
    const result = formatDateRange(start, end);
    expect(result).toContain('–');
    expect(result).toContain('Jun');
  });

  it('formats single day without dash', () => {
    const date = new Date('2026-03-10');
    const result = formatDateRange(date, date);
    expect(result).not.toContain('–');
  });
});

describe('timeAgo', () => {
  it('returns "just now" for recent times', () => {
    expect(timeAgo(new Date())).toBe('just now');
  });

  it('returns minutes ago', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinAgo)).toBe('5m ago');
  });

  it('returns hours ago', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    expect(timeAgo(threeHoursAgo)).toBe('3h ago');
  });

  it('returns days ago', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    expect(timeAgo(twoDaysAgo)).toBe('2d ago');
  });

  it('returns formatted date for old dates', () => {
    const oldDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const result = timeAgo(oldDate);
    expect(result).not.toContain('ago');
  });
});

describe('getDaysBetween', () => {
  it('returns each day in an inclusive range', () => {
    const days = getDaysBetween(new Date(2026, 5, 14), new Date(2026, 5, 16));
    expect(days).toHaveLength(3);
    expect(days[0].getDate()).toBe(14);
    expect(days[2].getDate()).toBe(16);
  });

  it('returns a single day when start and end are the same', () => {
    const days = getDaysBetween(new Date(2026, 5, 14), new Date(2026, 5, 14));
    expect(days).toHaveLength(1);
  });

  it('never returns an empty array when the range is reversed', () => {
    const days = getDaysBetween(new Date(2026, 7, 15), new Date(2026, 4, 17));
    expect(days.length).toBeGreaterThan(0);
  });

  it('normalises a reversed range to run earliest-first', () => {
    const days = getDaysBetween(new Date(2026, 5, 16), new Date(2026, 5, 14));
    expect(days).toHaveLength(3);
    expect(days[0].getDate()).toBe(14);
    expect(days[2].getDate()).toBe(16);
  });
});

describe('getCalendarDays', () => {
  it('covers the event range when no sessions exist', () => {
    const days = getCalendarDays(new Date(2026, 5, 14), new Date(2026, 5, 15), []);
    expect(days).toHaveLength(2);
  });

  it('includes a day that only a session falls on', () => {
    const days = getCalendarDays(new Date(2026, 4, 22), new Date(2026, 4, 22), [
      new Date(2026, 4, 23, 9, 0),
    ]);
    expect(days).toHaveLength(2);
    expect(days[1].getDate()).toBe(23);
  });

  it('does not duplicate a day that has both event coverage and sessions', () => {
    const days = getCalendarDays(new Date(2026, 4, 22), new Date(2026, 4, 22), [
      new Date(2026, 4, 22, 9, 0),
      new Date(2026, 4, 22, 14, 0),
    ]);
    expect(days).toHaveLength(1);
  });

  it('returns days in chronological order', () => {
    const days = getCalendarDays(new Date(2026, 4, 22), new Date(2026, 4, 22), [
      new Date(2026, 4, 25, 9, 0),
      new Date(2026, 4, 20, 9, 0),
    ]);
    expect(days.map((d) => d.getDate())).toEqual([20, 22, 25]);
  });

  it('still yields a usable day list for a reversed event range', () => {
    const days = getCalendarDays(new Date(2026, 7, 15), new Date(2026, 4, 17), [
      new Date(2026, 4, 15, 9, 0),
    ]);
    expect(days.length).toBeGreaterThan(0);
    expect(days.every((d) => !Number.isNaN(d.getTime()))).toBe(true);
  });

  it('always returns valid dates', () => {
    const days = getCalendarDays(new Date(2026, 5, 14), new Date(2026, 5, 15), []);
    expect(days.every((d) => !Number.isNaN(d.getTime()))).toBe(true);
  });
});

describe('addMinutes', () => {
  it('adds minutes to a date', () => {
    const result = addMinutes(new Date(2026, 5, 15, 9, 0), 90);
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(30);
  });

  it('subtracts when given a negative value', () => {
    const result = addMinutes(new Date(2026, 5, 15, 9, 0), -30);
    expect(result.getHours()).toBe(8);
    expect(result.getMinutes()).toBe(30);
  });

  it('rolls over to the next day', () => {
    const result = addMinutes(new Date(2026, 5, 15, 23, 30), 60);
    expect(result.getDate()).toBe(16);
    expect(result.getHours()).toBe(0);
  });

  it('does not mutate the input date', () => {
    const input = new Date(2026, 5, 15, 9, 0);
    addMinutes(input, 60);
    expect(input.getHours()).toBe(9);
  });
});

describe('snapToInterval', () => {
  it('snaps down to the nearest interval', () => {
    const result = snapToInterval(new Date(2026, 5, 15, 9, 11), 5);
    expect(result.getMinutes()).toBe(10);
  });

  it('snaps up to the nearest interval', () => {
    const result = snapToInterval(new Date(2026, 5, 15, 9, 13), 5);
    expect(result.getMinutes()).toBe(15);
  });

  it('leaves an already-aligned time unchanged', () => {
    const result = snapToInterval(new Date(2026, 5, 15, 9, 30), 15);
    expect(result.getMinutes()).toBe(30);
    expect(result.getHours()).toBe(9);
  });

  it('rolls the hour when snapping up past 60', () => {
    const result = snapToInterval(new Date(2026, 5, 15, 9, 58), 5);
    expect(result.getHours()).toBe(10);
    expect(result.getMinutes()).toBe(0);
  });

  it('zeroes seconds and milliseconds', () => {
    const input = new Date(2026, 5, 15, 9, 10, 42, 500);
    const result = snapToInterval(input, 5);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });
});

describe('toTimeInputValue', () => {
  it('formats as zero-padded 24-hour HH:MM', () => {
    expect(toTimeInputValue(new Date(2026, 5, 15, 9, 5))).toBe('09:05');
  });

  it('formats afternoon times in 24-hour form', () => {
    expect(toTimeInputValue(new Date(2026, 5, 15, 14, 30))).toBe('14:30');
  });

  it('formats midnight as 00:00', () => {
    expect(toTimeInputValue(new Date(2026, 5, 15, 0, 0))).toBe('00:00');
  });
});

describe('parseDateInput', () => {
  it('parses a yyyy-MM-dd value as a local date, not UTC', () => {
    const result = parseDateInput('2026-05-22');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(4);
    // `new Date('2026-05-22')` is UTC midnight, which is 21 May in any negative offset.
    expect(result.getDate()).toBe(22);
  });

  it('starts the day at midnight local time', () => {
    const result = parseDateInput('2026-05-22');
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('round-trips through setTimeOnDay on the same calendar day', () => {
    const result = setTimeOnDay(parseDateInput('2026-05-22'), '09:30');
    expect(result.getDate()).toBe(22);
    expect(result.getHours()).toBe(9);
  });

  it('handles a leap day', () => {
    const result = parseDateInput('2028-02-29');
    expect(result.getMonth()).toBe(1);
    expect(result.getDate()).toBe(29);
  });
});

describe('setTimeOnDay', () => {
  it('applies a time string to the given day', () => {
    const result = setTimeOnDay(new Date(2026, 5, 15, 18, 45), '09:30');
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(5);
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(9);
    expect(result.getMinutes()).toBe(30);
  });

  it('zeroes seconds and milliseconds', () => {
    const result = setTimeOnDay(new Date(2026, 5, 15, 18, 45, 30, 250), '09:30');
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('round-trips with toTimeInputValue', () => {
    const day = new Date(2026, 5, 15);
    expect(toTimeInputValue(setTimeOnDay(day, '14:05'))).toBe('14:05');
  });
});

describe('sessionsOverlap', () => {
  const at = (h: number, m = 0) => new Date(2026, 5, 15, h, m);

  it('detects a partial overlap', () => {
    expect(sessionsOverlap(at(9), at(10), at(9, 30), at(10, 30))).toBe(true);
  });

  it('detects full containment', () => {
    expect(sessionsOverlap(at(9), at(12), at(10), at(11))).toBe(true);
  });

  it('detects identical ranges', () => {
    expect(sessionsOverlap(at(9), at(10), at(9), at(10))).toBe(true);
  });

  it('treats back-to-back sessions as non-overlapping', () => {
    expect(sessionsOverlap(at(9), at(10), at(10), at(11))).toBe(false);
  });

  it('returns false for separate ranges', () => {
    expect(sessionsOverlap(at(9), at(10), at(14), at(15))).toBe(false);
  });

  it('is order-independent', () => {
    expect(sessionsOverlap(at(14), at(15), at(9), at(10))).toBe(false);
    expect(sessionsOverlap(at(9, 30), at(10, 30), at(9), at(10))).toBe(true);
  });

  it('returns false for ranges on different days at the same clock time', () => {
    const day1 = new Date(2026, 5, 15, 9, 0);
    const day1End = new Date(2026, 5, 15, 10, 0);
    const day2 = new Date(2026, 5, 16, 9, 0);
    const day2End = new Date(2026, 5, 16, 10, 0);
    expect(sessionsOverlap(day1, day1End, day2, day2End)).toBe(false);
  });
});
