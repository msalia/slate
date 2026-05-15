import 'server-only';
import { and, desc, eq, sql } from 'drizzle-orm';

import { db } from '@/db';
import {
  categories,
  eventCategories,
  events,
  presenters,
  sessionPresenters,
  sessions,
  tracks,
} from '@/db/schema';

export async function getEventsWithSessionCount(userId: string) {
  const result = await db
    .select({
      createdAt: events.createdAt,
      description: events.description,
      endDate: events.endDate,
      id: events.id,
      name: events.name,
      sessionCount: sql<number>`cast(count(distinct ${sessions.id}) as int)`,
      slug: events.slug,
      startDate: events.startDate,
      status: events.status,
      timezone: events.timezone,
      trackCount: sql<number>`cast(count(distinct ${tracks.id}) as int)`,
    })
    .from(events)
    .leftJoin(sessions, eq(events.id, sessions.eventId))
    .leftJoin(tracks, eq(events.id, tracks.eventId))
    .where(eq(events.userId, userId))
    .groupBy(events.id)
    .orderBy(events.createdAt);

  const eventsWithPresenters = await Promise.all(
    result.map(async (event) => {
      const eventPresenters = await db
        .selectDistinct({ name: presenters.name })
        .from(presenters)
        .innerJoin(sessionPresenters, eq(presenters.id, sessionPresenters.presenterId))
        .innerJoin(sessions, eq(sessionPresenters.sessionId, sessions.id))
        .where(eq(sessions.eventId, event.id))
        .limit(5);

      return { ...event, presenters: eventPresenters };
    }),
  );

  return eventsWithPresenters;
}

export async function getRecentEvents(userId: string, limit = 5) {
  return db
    .select({
      id: events.id,
      name: events.name,
      slug: events.slug,
      status: events.status,
    })
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy(desc(events.updatedAt))
    .limit(limit);
}

export async function getEventTracks(eventId: string) {
  return db
    .select({ id: tracks.id, name: tracks.name, position: tracks.position })
    .from(tracks)
    .where(eq(tracks.eventId, eventId))
    .orderBy(tracks.position);
}

export async function getEventCategories(eventId: string) {
  return db
    .select({
      color: categories.color,
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .innerJoin(eventCategories, eq(categories.id, eventCategories.categoryId))
    .where(eq(eventCategories.eventId, eventId));
}

export async function getUserCategories(userId: string) {
  return db
    .select({
      color: categories.color,
      id: categories.id,
      name: categories.name,
    })
    .from(categories)
    .where(eq(categories.userId, userId));
}

export async function getUserPresenters(userId: string) {
  const result = await db
    .select({
      bio: presenters.bio,
      eventCount: sql<number>`cast(count(distinct ${sessions.eventId}) as int)`,
      id: presenters.id,
      name: presenters.name,
      role: presenters.role,
      sessionCount: sql<number>`cast(count(distinct ${sessionPresenters.sessionId}) as int)`,
    })
    .from(presenters)
    .leftJoin(sessionPresenters, eq(presenters.id, sessionPresenters.presenterId))
    .leftJoin(sessions, eq(sessionPresenters.sessionId, sessions.id))
    .where(eq(presenters.userId, userId))
    .groupBy(presenters.id)
    .orderBy(presenters.name);

  return result;
}

export async function getEventWithDetails(slug: string, userId: string) {
  const result = await db
    .select()
    .from(events)
    .where(and(eq(events.slug, slug), eq(events.userId, userId)))
    .limit(1);

  return result[0] ?? null;
}

export async function getEventSessions(eventId: string) {
  const result = await db
    .select({
      categoryId: sessions.categoryId,
      description: sessions.description,
      endTime: sessions.endTime,
      id: sessions.id,
      isBreak: sessions.isBreak,
      position: sessions.position,
      startTime: sessions.startTime,
      title: sessions.title,
      trackId: sessions.trackId,
    })
    .from(sessions)
    .where(eq(sessions.eventId, eventId))
    .orderBy(sessions.startTime, sessions.position);

  const sessionsWithPresenters = await Promise.all(
    result.map(async (session) => {
      const presenterList = await db
        .select({ id: presenters.id, name: presenters.name })
        .from(presenters)
        .innerJoin(sessionPresenters, eq(presenters.id, sessionPresenters.presenterId))
        .where(eq(sessionPresenters.sessionId, session.id));

      return { ...session, presenters: presenterList };
    }),
  );

  return sessionsWithPresenters;
}
