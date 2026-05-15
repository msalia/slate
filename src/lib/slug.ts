import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { events } from '@/db/schema';

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function uniqueSlug(name: string): Promise<string> {
  const base = toSlug(name);
  let slug = base;
  let suffix = 1;

  while (true) {
    const existing = await db
      .select({ id: events.id })
      .from(events)
      .where(eq(events.slug, slug))
      .limit(1);

    if (existing.length === 0) {
      return slug;
    }
    slug = `${base}-${++suffix}`;
  }
}
