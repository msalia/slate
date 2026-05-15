'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

import { db } from '@/db';
import { events } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { type FormState } from '@/lib/auth/validation';
import { uniqueSlug } from '@/lib/slug';
import { generatePublishToken } from '@/lib/token';

const createEventSchema = z.object({
  endDate: z.string().min(1, 'End date is required'),
  name: z.string().min(1, 'Name is required').max(100).trim(),
  startDate: z.string().min(1, 'Start date is required'),
  timezone: z.string().min(1),
});

const updateEventSchema = z.object({
  description: z.string().optional(),
  endDate: z.string().min(1, 'End date is required'),
  name: z.string().min(1, 'Name is required').max(100).trim(),
  startDate: z.string().min(1, 'Start date is required'),
  timezone: z.string().min(1),
});

export async function createEvent(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const parsed = createEventSchema.safeParse({
    endDate: formData.get('endDate'),
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    timezone: formData.get('timezone'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { endDate, name, startDate, timezone } = parsed.data;

  if (new Date(endDate) < new Date(startDate)) {
    return { errors: { endDate: ['End date must be after start date'] } };
  }

  const slug = await uniqueSlug(name);

  await db.insert(events).values({
    endDate: new Date(endDate),
    name,
    slug,
    startDate: new Date(startDate),
    timezone,
    userId: session.userId,
  });

  redirect(`/events/${slug}/edit`);
}

export async function updateEvent(
  eventId: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await verifySession();

  const parsed = updateEventSchema.safeParse({
    description: formData.get('description') || undefined,
    endDate: formData.get('endDate'),
    name: formData.get('name'),
    startDate: formData.get('startDate'),
    timezone: formData.get('timezone'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { description, endDate, name, startDate, timezone } = parsed.data;

  await db
    .update(events)
    .set({
      description: description ?? null,
      endDate: new Date(endDate),
      name,
      startDate: new Date(startDate),
      timezone,
      updatedAt: new Date(),
    })
    .where(and(eq(events.id, eventId), eq(events.userId, session.userId)));

  revalidatePath('/dashboard');
  return { message: 'Event updated', success: true };
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
