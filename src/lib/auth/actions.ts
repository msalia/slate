'use server';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { db } from '@/db';
import { users } from '@/db/schema';
import { verifySession } from '@/lib/auth/dal';
import { createSession, deleteSession } from '@/lib/auth/session';
import {
  changePasswordSchema,
  type FormState,
  loginSchema,
  signupSchema,
  updateProfileSchema,
} from '@/lib/auth/validation';

export async function signup(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = signupSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, name, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { errors: { email: ['An account with this email already exists'] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning({ id: users.id });

  const user = result[0];
  if (!user) {
    return { message: 'Failed to create account. Please try again.' };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  const result = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];
  if (!user || !user.passwordHash) {
    return { message: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { message: 'Invalid email or password' };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const parsed = updateProfileSchema.safeParse({
    name: formData.get('name'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(users.id, session.userId));

  return { message: 'Profile updated', success: true };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession();

  const parsed = changePasswordSchema.safeParse({
    confirmPassword: formData.get('confirmPassword'),
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const result = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = result[0];
  if (!user?.passwordHash) {
    return { message: 'Cannot change password for OAuth accounts' };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { message: 'Current password is incorrect' };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, session.userId));

  return { message: 'Password changed', success: true };
}

export async function deleteAccount() {
  const session = await verifySession();
  await db.delete(users).where(eq(users.id, session.userId));
  await deleteSession();
  redirect('/login');
}
