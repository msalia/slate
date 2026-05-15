'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { events, sessions, tracks } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';

async function verifyEventOwnership(eventId: string, userId: string) {
  const result = await db
    .select({ id: events.id, slug: events.slug })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.userId, userId)))
    .limit(1);
  return result[0] ?? null;
}

export async function addTrack(eventId: string, name: string) {
  const session = await verifySession();
  const event = await verifyEventOwnership(eventId, session.userId);
  if (!event) {
    return;
  }

  const maxPos = await db
    .select({ max: sql<number>`coalesce(max(${tracks.position}), -1)` })
    .from(tracks)
    .where(eq(tracks.eventId, eventId));

  await db.insert(tracks).values({
    eventId,
    name,
    position: (maxPos[0]?.max ?? -1) + 1,
  });

  revalidatePath(`/events/${event.slug}/edit`);
}

export async function updateTrack(trackId: string, name: string) {
  const session = await verifySession();

  const track = await db
    .select({ eventId: tracks.eventId })
    .from(tracks)
    .where(eq(tracks.id, trackId))
    .limit(1);

  if (!track[0]) {
    return;
  }
  const event = await verifyEventOwnership(track[0].eventId, session.userId);
  if (!event) {
    return;
  }

  await db.update(tracks).set({ name }).where(eq(tracks.id, trackId));
  revalidatePath(`/events/${event.slug}/edit`);
}

export async function deleteTrack(trackId: string) {
  const session = await verifySession();

  const track = await db
    .select({ eventId: tracks.eventId })
    .from(tracks)
    .where(eq(tracks.id, trackId))
    .limit(1);

  if (!track[0]) {
    return;
  }
  const event = await verifyEventOwnership(track[0].eventId, session.userId);
  if (!event) {
    return;
  }

  const assignedSessions = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(eq(sessions.trackId, trackId))
    .limit(1);

  if (assignedSessions.length > 0) {
    return { error: 'Cannot delete a track with assigned sessions. Reassign them first.' };
  }

  await db.delete(tracks).where(eq(tracks.id, trackId));
  revalidatePath(`/events/${event.slug}/edit`);
}

export async function reorderTracks(eventId: string, trackIds: string[]) {
  const session = await verifySession();
  const event = await verifyEventOwnership(eventId, session.userId);
  if (!event) {
    return;
  }

  await Promise.all(
    trackIds.map((id, i) => db.update(tracks).set({ position: i }).where(eq(tracks.id, id))),
  );

  revalidatePath(`/events/${event.slug}/edit`);
}
