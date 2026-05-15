import bcrypt from 'bcryptjs';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });

async function seed() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password1', 10);
  const [user] = await db
    .insert(schema.users)
    .values({
      email: 'demo@slate.dev',
      name: 'Demo User',
      passwordHash,
    })
    .returning();

  const [cat1, cat2, cat3] = await db
    .insert(schema.categories)
    .values([
      { color: 'category-blue', name: 'Talk', userId: user.id },
      { color: 'category-green', name: 'Workshop', userId: user.id },
      { color: 'category-orange', name: 'Panel', userId: user.id },
    ])
    .returning();

  const [presenter1, presenter2, presenter3] = await db
    .insert(schema.presenters)
    .values([
      { name: 'Alice Chen', role: 'Engineering Lead', userId: user.id },
      { name: 'Bob Martinez', role: 'Product Designer', userId: user.id },
      { name: 'Carol Kim', role: 'CTO', userId: user.id },
    ])
    .returning();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const dayAfter = new Date(tomorrow);
  dayAfter.setDate(dayAfter.getDate() + 1);

  const [event] = await db
    .insert(schema.events)
    .values({
      description: 'A sample two-day tech conference for development and testing.',
      endDate: dayAfter,
      name: 'Tech Summit 2026',
      slug: 'tech-summit-2026',
      startDate: tomorrow,
      status: 'draft',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userId: user.id,
    })
    .returning();

  await db.insert(schema.eventCategories).values([
    { categoryId: cat1.id, eventId: event.id },
    { categoryId: cat2.id, eventId: event.id },
    { categoryId: cat3.id, eventId: event.id },
  ]);

  const [track1, track2] = await db
    .insert(schema.tracks)
    .values([
      { eventId: event.id, name: 'Main Stage', position: 0 },
      { eventId: event.id, name: 'Workshop Room', position: 1 },
    ])
    .returning();

  function timeOn(day: Date, hours: number, minutes: number) {
    const d = new Date(day);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  const [s1, s2, s3, s4] = await db
    .insert(schema.sessions)
    .values([
      {
        categoryId: cat1.id,
        endTime: timeOn(tomorrow, 9, 30),
        eventId: event.id,
        position: 0,
        startTime: timeOn(tomorrow, 9, 0),
        title: 'Opening Keynote',
        trackId: track1.id,
      },
      {
        categoryId: cat2.id,
        description: 'Hands-on workshop covering modern React patterns.',
        endTime: timeOn(tomorrow, 11, 0),
        eventId: event.id,
        position: 1,
        startTime: timeOn(tomorrow, 9, 30),
        title: 'React Deep Dive',
        trackId: track2.id,
      },
      {
        endTime: timeOn(tomorrow, 11, 15),
        eventId: event.id,
        isBreak: true,
        position: 2,
        startTime: timeOn(tomorrow, 11, 0),
        title: 'Coffee Break',
        trackId: null,
      },
      {
        categoryId: cat3.id,
        description: 'Industry leaders discuss the future of web development.',
        endTime: timeOn(tomorrow, 12, 30),
        eventId: event.id,
        position: 3,
        startTime: timeOn(tomorrow, 11, 15),
        title: 'Future of the Web',
        trackId: track1.id,
      },
    ])
    .returning();

  await db.insert(schema.sessionPresenters).values([
    { presenterId: presenter3.id, sessionId: s1.id },
    { presenterId: presenter1.id, sessionId: s2.id },
    { presenterId: presenter1.id, sessionId: s4.id },
    { presenterId: presenter2.id, sessionId: s4.id },
    { presenterId: presenter3.id, sessionId: s4.id },
  ]);

  console.log('Seed complete!');
  console.log(`  User: demo@slate.dev / password1`);
  console.log(`  Event: ${event.name} (${event.slug})`);

  await client.end();
}

seed().catch((e) => {
  console.error('Seed failed:', e);
  process.exit(1);
});
