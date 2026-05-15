import { sql } from 'drizzle-orm';

import { db } from '@/db';

export const dynamic = 'force-dynamic';

async function getHealth(): Promise<string> {
  try {
    await db.execute(sql`SELECT 1`);
    return 'API and database are healthy';
  } catch {
    return 'Database is unreachable';
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">{health}</h1>
    </main>
  );
}
