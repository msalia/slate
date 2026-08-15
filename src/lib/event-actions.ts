'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { db } from '@/db';
import { events } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { type FormResult } from '@/lib/auth/validation';
import {
  createEventSchema,
  type CreateEventValues,
  updateEventSchema,
  type UpdateEventValues,
} from '@/lib/event-schema';
import { uniqueSlug } from '@/lib/slug';
import { generatePublishToken } from '@/lib/token';
import { parseDateInput } from '@/lib/utils';

export async function createEvent(input: CreateEventValues): Promise<FormResult> {
  const session = await verifySession();

  const parsed = createEventSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid event' };
  }

  const { endDate, name, startDate, timezone } = parsed.data;

  const slug = await uniqueSlug(name);

  await db.insert(events).values({
    endDate: parseDateInput(endDate),
    name,
    slug,
    startDate: parseDateInput(startDate),
    timezone,
    userId: session.userId,
  });

  redirect(`/events/${slug}/edit`);
}

export async function updateEvent(eventId: string, input: UpdateEventValues): Promise<FormResult> {
  const session = await verifySession();

  const parsed = updateEventSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid event' };
  }

  const { description, endDate, name, startDate, timezone } = parsed.data;

  const [updated] = await db
    .update(events)
    .set({
      description: description ?? null,
      endDate: parseDateInput(endDate),
      name,
      startDate: parseDateInput(startDate),
      timezone,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, eventId), eq(events.userId, session.userId)))
    .returning({ slug: events.slug });

  if (!updated) {
    return { error: 'Event not found' };
  }

  revalidatePath('/dashboard');
  revalidatePath(`/events/${updated.slug}/edit`);
  return { success: true };
}

export async function toggleEventStatus(eventId: string) {
  const session = await verifySession();

  const result = await db
    .select({ status: events.status })
    .from(events)
    .where(and(eq(events.id, eventId), eq(events.userId, session.userId)))
    .limit(1);

  const event = result[0];
  if (!event) {
    return;
  }

  const publishing = event.status === 'draft';
  const newStatus = publishing ? 'published' : 'draft';
  const publishToken = publishing ? generatePublishToken() : null;

  await db
    .update(events)
    .set({ publishToken, status: newStatus, updatedAt: new Date() })
    .where(and(eq(events.id, eventId), eq(events.userId, session.userId)));

  revalidatePath('/dashboard');
  return { publishToken };
}

export async function deleteEvent(eventId: string) {
  const session = await verifySession();

  await db.delete(events).where(and(eq(events.id, eventId), eq(events.userId, session.userId)));

  revalidatePath('/dashboard');
  redirect('/dashboard');
}
