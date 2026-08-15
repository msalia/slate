import { addMinutes, sessionsOverlap, snapToInterval } from '@/lib/utils';

interface PlacedSession {
  endTime: Date;
  id: string;
  startTime: Date;
  trackId: string | null;
}

/**
 * Moves a session by `deltaMinutes`, snapping the new start to the drag grid
 * and keeping the original duration — a drag should never resize a session.
 */
export function shiftSessionTimes(
  startTime: Date,
  endTime: Date,
  deltaMinutes: number,
  snapMinutes: number,
): { end: Date; start: Date } {
  const durationMs = new Date(endTime).getTime() - new Date(startTime).getTime();
  const start = snapToInterval(addMinutes(startTime, deltaMinutes), snapMinutes);
  return { end: new Date(start.getTime() + durationMs), start };
}

/**
 * The client-side half of the overlap rule, so a drag can be refused before it
 * reaches the server. `session-actions.ts` enforces the same rule against the
 * database — this one only exists to make the drag feel honest.
 */
export function findConflictingSession<T extends PlacedSession>(
  sessions: T[],
  candidate: { end: Date; excludeId?: string; start: Date; trackId: string | null },
): T | null {
  if (!candidate.trackId) {
    return null;
  }

  return (
    sessions.find(
      (session) =>
        session.trackId === candidate.trackId &&
        session.id !== candidate.excludeId &&
        sessionsOverlap(candidate.start, candidate.end, session.startTime, session.endTime),
    ) ?? null
  );
}
