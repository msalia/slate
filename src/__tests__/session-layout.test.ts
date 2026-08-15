import { describe, expect, it } from 'vitest';

import { findConflictingSession, shiftSessionTimes } from '@/lib/session-layout';

const at = (h: number, m = 0) => new Date(2026, 5, 15, h, m);

describe('shiftSessionTimes', () => {
  it('moves a session forward by the delta', () => {
    const { start } = shiftSessionTimes(at(9), at(10), 60, 5);
    expect(start.getHours()).toBe(10);
    expect(start.getMinutes()).toBe(0);
  });

  it('moves a session backward for a negative delta', () => {
    const { start } = shiftSessionTimes(at(9), at(10), -30, 5);
    expect(start.getHours()).toBe(8);
    expect(start.getMinutes()).toBe(30);
  });

  it('preserves the original duration', () => {
    const { end, start } = shiftSessionTimes(at(9), at(10, 30), 47, 5);
    expect(end.getTime() - start.getTime()).toBe(90 * 60 * 1000);
  });

  it('snaps the new start to the given interval', () => {
    const { start } = shiftSessionTimes(at(9), at(10), 47, 5);
    expect(start.getMinutes() % 5).toBe(0);
  });

  it('snaps to 15-minute intervals when asked', () => {
    const { start } = shiftSessionTimes(at(9), at(10), 20, 15);
    expect(start.getMinutes()).toBe(15);
  });

  it('carries a session across midnight', () => {
    const { end, start } = shiftSessionTimes(at(23), at(23, 30), 90, 5);
    expect(start.getDate()).toBe(16);
    expect(start.getHours()).toBe(0);
    expect(end.getHours()).toBe(1);
  });

  it('does not mutate the inputs', () => {
    const start = at(9);
    const end = at(10);
    shiftSessionTimes(start, end, 120, 5);
    expect(start.getHours()).toBe(9);
    expect(end.getHours()).toBe(10);
  });
});

describe('findConflictingSession', () => {
  const sessions = [
    { endTime: at(10), id: 'a', startTime: at(9), trackId: 't1' },
    { endTime: at(13), id: 'b', startTime: at(12), trackId: 't1' },
    { endTime: at(10), id: 'c', startTime: at(9), trackId: 't2' },
  ];

  it('finds a session overlapping in the same track', () => {
    const hit = findConflictingSession(sessions, {
      end: at(10, 30),
      start: at(9, 30),
      trackId: 't1',
    });
    expect(hit?.id).toBe('a');
  });

  it('ignores sessions in other tracks', () => {
    const hit = findConflictingSession(sessions, {
      end: at(10, 30),
      start: at(9, 30),
      trackId: 't3',
    });
    expect(hit).toBeNull();
  });

  it('ignores the session being moved', () => {
    const hit = findConflictingSession(sessions, {
      end: at(10),
      excludeId: 'a',
      start: at(9),
      trackId: 't1',
    });
    expect(hit).toBeNull();
  });

  it('treats back-to-back sessions as free', () => {
    const hit = findConflictingSession(sessions, { end: at(12), start: at(10), trackId: 't1' });
    expect(hit).toBeNull();
  });

  it('returns null for the unassigned column, which has no track to clash in', () => {
    const hit = findConflictingSession(sessions, {
      end: at(10, 30),
      start: at(9, 30),
      trackId: null,
    });
    expect(hit).toBeNull();
  });

  it('detects a conflict against the second session in a track', () => {
    const hit = findConflictingSession(sessions, {
      end: at(12, 30),
      start: at(11, 30),
      trackId: 't1',
    });
    expect(hit?.id).toBe('b');
  });

  it('ignores sessions on a different day at the same clock time', () => {
    const nextDay = [
      {
        endTime: new Date(2026, 5, 16, 10),
        id: 'd',
        startTime: new Date(2026, 5, 16, 9),
        trackId: 't1',
      },
    ];
    const hit = findConflictingSession(nextDay, { end: at(10), start: at(9), trackId: 't1' });
    expect(hit).toBeNull();
  });
});
