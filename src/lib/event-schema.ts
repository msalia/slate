import { z } from 'zod';

/**
 * Shared by the event forms and the server actions. Kept out of the
 * `'use server'` module because those may only export async functions.
 */
export const createEventSchema = z
  .object({
    endDate: z.string().min(1, 'End date is required'),
    name: z.string().trim().min(1, 'Name is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    timezone: z.string().min(1),
  })
  // ISO yyyy-MM-dd sorts lexicographically, so string comparison is date order.
  .refine((values) => values.endDate >= values.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export const updateEventSchema = z
  .object({
    description: z.string().nullable(),
    endDate: z.string().min(1, 'End date is required'),
    name: z.string().trim().min(1, 'Name is required').max(100),
    startDate: z.string().min(1, 'Start date is required'),
    timezone: z.string().min(1),
  })
  .refine((values) => values.endDate >= values.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  });

export type CreateEventValues = z.infer<typeof createEventSchema>;
export type UpdateEventValues = z.infer<typeof updateEventSchema>;
