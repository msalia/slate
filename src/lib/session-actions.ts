'use server';

import { and, eq, ne } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { events, sessionPresenters, sessions } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { sessionFormSchema, type SessionFormValues, sessionMoveSchema } from '@/lib/session-schema';
import { parseDateInput, sessionsOverlap, setTimeOnDay } from '@/lib/utils';

export type SessionActionResult = { error?: string; success?: boolean };

async function verifyEventOwnership(eventId: string, userId: string) {
  const result = await db
    .select({ id: events.id, slug: events.slug })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

/**
 * Rejects a session that would overlap another one in the same track.
 * Sessions with no track are exempt — they aren't pinned to a column.
 */
async function findConflict(
  eventId: string,
  trackId: string | null,
  startTime: Date,
  endTime: Date,
  excludeSessionId?: string,
) {
  if (!trackId) {
    return null;
  }

  const scope = [eq(sessions.eventId, eventId), eq(sessions.trackId, trackId)];
  if (excludeSessionId) {
    scope.push(ne(sessions.id, excludeSessionId));
  }

  const trackSessions = await db
    .select({ endTime: sessions.endTime, startTime: sessions.startTime, title: sessions.title })
    .from(sessions)
    .where(and(...scope));

  return (
    trackSessions.find((s) => sessionsOverlap(startTime, endTime, s.startTime, s.endTime)) ?? null
  );
}

async function setPresenters(sessionId: string, presenterIds: string[]) {
  await db.delete(sessionPresenters).where(eq(sessionPresenters.sessionId, sessionId));
  if (presenterIds.length > 0) {
    await db
      .insert(sessionPresenters)
      .values(presenterIds.map((presenterId) => ({ presenterId, sessionId })));
  }
}

export async function createSession(
  eventId: string,
  input: SessionFormValues,
): Promise<SessionActionResult> {
  const session = await verifySession();
  const event = await verifyEventOwnership(eventId, session.userId);
  if (!event) {
    return { error: 'Event not found' };
  }

  const parsed = sessionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid session' };
  }

  const day = parseDateInput(parsed.data.date);
  const startTime = setTimeOnDay(day, parsed.data.startTime);
  const endTime = setTimeOnDay(day, parsed.data.endTime);

  const conflict = await findConflict(eventId, parsed.data.trackId, startTime, endTime);
  if (conflict) {
    return { error: `Overlaps "${conflict.title}" in this track` };
  }

  const [created] = await db
    .insert(sessions)
    .values({
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      endTime,
      eventId,
      isBreak: parsed.data.isBreak,
      startTime,
      title: parsed.data.title,
      trackId: parsed.data.trackId,
    })
    .returning({ id: sessions.id });

  await setPresenters(created.id, parsed.data.presenterIds);

  revalidatePath(`/events/${event.slug}/edit`);
  return { success: true };
}

export async function updateSession(
  sessionId: string,
  input: SessionFormValues,
): Promise<SessionActionResult> {
  const session = await verifySession();

  const existing = await db
    .select({ eventId: sessions.eventId })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!existing[0]) {
    return { error: 'Session not found' };
  }

  const event = await verifyEventOwnership(existing[0].eventId, session.userId);
  if (!event) {
    return { error: 'Session not found' };
  }

  const parsed = sessionFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid session' };
  }

  const day = parseDateInput(parsed.data.date);
  const startTime = setTimeOnDay(day, parsed.data.startTime);
  const endTime = setTimeOnDay(day, parsed.data.endTime);

  const conflict = await findConflict(
    existing[0].eventId,
    parsed.data.trackId,
    startTime,
    endTime,
    sessionId,
  );
  if (conflict) {
    return { error: `Overlaps "${conflict.title}" in this track` };
  }

  await db
    .update(sessions)
    .set({
      categoryId: parsed.data.categoryId,
      description: parsed.data.description,
      endTime,
      isBreak: parsed.data.isBreak,
      startTime,
      title: parsed.data.title,
      trackId: parsed.data.trackId,
      updatedAt: new Date(),
    })
    .where(eq(sessions.id, sessionId));

  await setPresenters(sessionId, parsed.data.presenterIds);

  revalidatePath(`/events/${event.slug}/edit`);
  return { success: true };
}

/**
 * Narrow action for drag-and-drop: only ever moves a session in time and
 * between tracks, so a drag doesn't have to round-trip the whole form.
 */
export async function moveSession(
  sessionId: string,
  move: { endTime: string; startTime: string; trackId: string | null },
): Promise<SessionActionResult> {
  const session = await verifySession();

  const existing = await db
    .select({ eventId: sessions.eventId })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!existing[0]) {
    return { error: 'Session not found' };
  }

  const event = await verifyEventOwnership(existing[0].eventId, session.userId);
  if (!event) {
    return { error: 'Session not found' };
  }

  const parsed = sessionMoveSchema.safeParse(move);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid move' };
  }

  const startTime = new Date(parsed.data.startTime);
  const endTime = new Date(parsed.data.endTime);

  if (Number.isNaN(startTime.getTime()) || Number.isNaN(endTime.getTime())) {
    return { error: 'Invalid move' };
  }
  if (endTime <= startTime) {
    return { error: 'End time must be after start time' };
  }

  const conflict = await findConflict(
    existing[0].eventId,
    parsed.data.trackId,
    startTime,
    endTime,
    sessionId,
  );
  if (conflict) {
    return { error: `Overlaps "${conflict.title}" in this track` };
  }

  await db
    .update(sessions)
    .set({ endTime, startTime, trackId: parsed.data.trackId, updatedAt: new Date() })
    .where(eq(sessions.id, sessionId));

  revalidatePath(`/events/${event.slug}/edit`);
  return { success: true };
}

export async function deleteSession(sessionId: string): Promise<SessionActionResult> {
  const session = await verifySession();

  const existing = await db
    .select({ eventId: sessions.eventId })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (!existing[0]) {
    return { error: 'Session not found' };
  }

  const event = await verifyEventOwnership(existing[0].eventId, session.userId);
  if (!event) {
    return { error: 'Session not found' };
  }

  await db.delete(sessions).where(eq(sessions.id, sessionId));

  revalidatePath(`/events/${event.slug}/edit`);
  return { success: true };
}
