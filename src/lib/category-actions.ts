'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { categories, eventCategories } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';

export async function createCategory(name: string, color: string) {
  const session = await verifySession();

  const [cat] = await db
    .insert(categories)
    .values({ color, name, userId: session.userId })
    .returning();

  revalidatePath('/dashboard');
  return cat;
}

export async function updateCategory(categoryId: string, name: string, color: string) {
  const session = await verifySession();

  await db
    .update(categories)
    .set({ color, name })
    .where(and(eq(categories.id, categoryId), eq(categories.userId, session.userId)));

  revalidatePath('/dashboard');
}

export async function deleteCategory(categoryId: string) {
  const session = await verifySession();

  await db
    .delete(categories)
    .where(and(eq(categories.id, categoryId), eq(categories.userId, session.userId)));

  revalidatePath('/dashboard');
}

export async function addCategoryToEvent(eventId: string, categoryId: string) {
  await verifySession();

  await db.insert(eventCategories).values({ categoryId, eventId }).onConflictDoNothing();

  revalidatePath('/dashboard');
}

export async function removeCategoryFromEvent(eventId: string, categoryId: string) {
  await verifySession();

  await db
    .delete(eventCategories)
    .where(and(eq(eventCategories.eventId, eventId), eq(eventCategories.categoryId, categoryId)));

  revalidatePath('/dashboard');
}
