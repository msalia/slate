'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { presenters, sessionPresenters } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';

export async function createPresenter(
  name: string,
  role: string | null,
  bio: string | null = null,
) {
  const session = await verifySession();

  const [presenter] = await db
    .insert(presenters)
    .values({ bio, name, role, userId: session.userId })
    .returning();

  revalidatePath('/presenters');
  return presenter;
}

export async function updatePresenter(
  presenterId: string,
  name: string,
  role: string | null,
  bio: string | null = null,
) {
  const session = await verifySession();

  await db
    .update(presenters)
    .set({ bio, name, role })
    .where(and(eq(presenters.id, presenterId), eq(presenters.userId, session.userId)));

  revalidatePath('/presenters');
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
