import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').trim(),
});

export const changePasswordSchema = z
  .object({
    confirmPassword: z.string(),
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type SignupValues = z.infer<typeof signupSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

/**
 * What every server action returns. Forms validate with the same zod schema
 * before submitting, so `error` carries what only the server can know — a
 * duplicate email, a wrong current password. `field` lets the form attach the
 * message to an input via react-hook-form's `setError` instead of stranding it
 * at the top of the form.
 */
export type FormResult<TField extends string = string> = {
  error?: string;
  field?: TField;
  success?: boolean;
};
