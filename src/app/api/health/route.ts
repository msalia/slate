import { sql } from 'drizzle-orm';

import { db } from '@/db';

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return Response.json({ db: 'connected', status: 'healthy' });
  } catch {
    return Response.json({ db: 'disconnected', status: 'unhealthy' }, { status: 503 });
  }
}
