'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { presenters, sessionPresenters } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { type FormResult } from '@/lib/auth/validation';
import { presenterFormSchema, type PresenterFormValues } from '@/lib/presenter-schema';

export async function createPresenter(
  input: PresenterFormValues,
): Promise<FormResult & { presenterId?: string }> {
  const session = await verifySession();

  const parsed = presenterFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid presenter' };
  }

  const [presenter] = await db
    .insert(presenters)
    .values({ ...parsed.data, userId: session.userId })
    .returning({ id: presenters.id });

  revalidatePath('/presenters');
  return { presenterId: presenter.id, success: true };
}

export async function updatePresenter(
  presenterId: string,
  input: PresenterFormValues,
): Promise<FormResult> {
  const session = await verifySession();

  const parsed = presenterFormSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid presenter' };
  }

  await db
    .update(presenters)
    .set(parsed.data)
    .where(and(eq(presenters.id, presenterId), eq(presenters.userId, session.userId)));

  revalidatePath('/presenters');
  return { success: true };
}

export async function deletePresenter(presenterId: string) {
  const session = await verifySession();

  await db
    .delete(presenters)
    .where(and(eq(presenters.id, presenterId), eq(presenters.userId, session.userId)));

  revalidatePath('/presenters');
}

export async function assignPresenterToSession(sessionId: string, presenterId: string) {
  await verifySession();

  await db.insert(sessionPresenters).values({ presenterId, sessionId }).onConflictDoNothing();
}

export async function removePresenterFromSession(sessionId: string, presenterId: string) {
  await verifySession();

  await db
    .delete(sessionPresenters)
    .where(
      and(
        eq(sessionPresenters.sessionId, sessionId),
        eq(sessionPresenters.presenterId, presenterId),
      ),
    );
}
