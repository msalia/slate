import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const eventStatusEnum = pgEnum('event_status', ['draft', 'published']);

// ── Users ──────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  email: text('email').notNull().unique(),
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  passwordHash: text('password_hash'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  categories: many(categories),
  events: many(events),
  presenters: many(presenters),
}));

// ── Events ─────────────────────────────────────────────────────────────────────

export const events = pgTable('events', {
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  description: text('description'),
  endDate: timestamp('end_date', { mode: 'date', withTimezone: true }).notNull(),
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  publishToken: text('publish_token'),
  slug: text('slug').notNull().unique(),
  startDate: timestamp('start_date', { mode: 'date', withTimezone: true }).notNull(),
  status: eventStatusEnum('status').notNull().default('draft'),
  timezone: text('timezone').notNull().default('UTC'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const eventsRelations = relations(events, ({ many, one }) => ({
  eventCategories: many(eventCategories),
  sessions: many(sessions),
  tracks: many(tracks),
  user: one(users, { fields: [events.userId], references: [users.id] }),
}));

// ── Tracks ─────────────────────────────────────────────────────────────────────

export const tracks = pgTable('tracks', {
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  position: integer('position').notNull().default(0),
});

export const tracksRelations = relations(tracks, ({ many, one }) => ({
  event: one(events, { fields: [tracks.eventId], references: [events.id] }),
  sessions: many(sessions),
}));

// ── Categories ─────────────────────────────────────────────────────────────────

export const categories = pgTable('categories', {
  color: text('color').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const categoriesRelations = relations(categories, ({ many, one }) => ({
  eventCategories: many(eventCategories),
  sessions: many(sessions),
  user: one(users, { fields: [categories.userId], references: [users.id] }),
}));

// ── Event ↔ Categories (junction) ──────────────────────────────────────────────

export const eventCategories = pgTable(
  'event_categories',
  {
    categoryId: uuid('category_id')
      .notNull()
      .references(() => categories.id, { onDelete: 'cascade' }),
    eventId: uuid('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.eventId, t.categoryId] })],
);

export const eventCategoriesRelations = relations(eventCategories, ({ one }) => ({
  category: one(categories, { fields: [eventCategories.categoryId], references: [categories.id] }),
  event: one(events, { fields: [eventCategories.eventId], references: [events.id] }),
}));

// ── Presenters ─────────────────────────────────────────────────────────────────

export const presenters = pgTable('presenters', {
  bio: text('bio'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  role: text('role'),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
});

export const presentersRelations = relations(presenters, ({ many, one }) => ({
  sessionPresenters: many(sessionPresenters),
  user: one(users, { fields: [presenters.userId], references: [users.id] }),
}));

// ── Sessions ───────────────────────────────────────────────────────────────────

export const sessions = pgTable('sessions', {
  categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  description: text('description'),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  eventId: uuid('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  id: uuid('id').defaultRandom().primaryKey(),
  isBreak: boolean('is_break').notNull().default(false),
  position: integer('position').notNull().default(0),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  title: text('title').notNull(),
  trackId: uuid('track_id').references(() => tracks.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sessionsRelations = relations(sessions, ({ many, one }) => ({
  category: one(categories, { fields: [sessions.categoryId], references: [categories.id] }),
  event: one(events, { fields: [sessions.eventId], references: [events.id] }),
  sessionPresenters: many(sessionPresenters),
  track: one(tracks, { fields: [sessions.trackId], references: [tracks.id] }),
}));

// ── Session ↔ Presenters (junction) ────────────────────────────────────────────

export const sessionPresenters = pgTable(
  'session_presenters',
  {
    presenterId: uuid('presenter_id')
      .notNull()
      .references(() => presenters.id, { onDelete: 'cascade' }),
    sessionId: uuid('session_id')
      .notNull()
      .references(() => sessions.id, { onDelete: 'cascade' }),
  },
  (t) => [primaryKey({ columns: [t.sessionId, t.presenterId] })],
);

export const sessionPresentersRelations = relations(sessionPresenters, ({ one }) => ({
  presenter: one(presenters, {
    fields: [sessionPresenters.presenterId],
    references: [presenters.id],
  }),
  session: one(sessions, { fields: [sessionPresenters.sessionId], references: [sessions.id] }),
}));
