import { z } from 'zod';

/** Shared by the presenter dialogs and the server actions. */
export const presenterFormSchema = z.object({
  bio: z.string().max(1000).nullable(),
  name: z.string().trim().min(1, 'Name is required').max(100),
  role: z.string().max(100).nullable(),
});

export type PresenterFormValues = z.infer<typeof presenterFormSchema>;
