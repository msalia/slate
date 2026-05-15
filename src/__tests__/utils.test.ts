import { describe, expect, it } from 'vitest';

import { formatDateRange, getInitials, timeAgo } from '@/lib/utils';

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
