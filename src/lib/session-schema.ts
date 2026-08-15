import { z } from 'zod';

/**
 * Shared by the session form (react-hook-form + zodResolver) and the server
 * action, so client and server enforce exactly the same rules.
 */
export const sessionFormSchema = z
  .object({
    categoryId: z.string().uuid().nullable(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date is required')
      .describe('yyyy-MM-dd, interpreted in the organizer’s local time'),
    description: z.string().max(2000).nullable(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time is required'),
    isBreak: z.boolean(),
    presenterIds: z.array(z.string().uuid()),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time is required'),
    title: z.string().trim().min(1, 'Title is required').max(200),
    trackId: z.string().uuid().nullable(),
  })
  // Both values are zero-padded 24-hour times, so string ordering is time ordering.
  .refine((values) => values.endTime > values.startTime, {
    message: 'End time must be after start time',
    path: ['endTime'],
  });

export type SessionFormValues = z.infer<typeof sessionFormSchema>;

/** Payload for a drag-and-drop move. Times travel as ISO strings. */
export const sessionMoveSchema = z.object({
  endTime: z.string().datetime({ offset: true }),
  startTime: z.string().datetime({ offset: true }),
  trackId: z.string().uuid().nullable(),
});

export type SessionMove = z.infer<typeof sessionMoveSchema>;
