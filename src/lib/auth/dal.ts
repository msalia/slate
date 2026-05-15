import 'server-only';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { cache } from 'react';

import { db } from '@/db';
import { users } from '@/db/schema';
import { decrypt } from '@/lib/auth/session';

export const verifySession = cache(async () => {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (!session?.userId) {
    redirect('/login');
  }

  return { userId: session.userId };
});

export const getUser = cache(async () => {
  const session = await verifySession();

  const result = await db
    .select({
      avatarUrl: users.avatarUrl,
      email: users.email,
      id: users.id,
      name: users.name,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  return result[0] ?? null;
});
