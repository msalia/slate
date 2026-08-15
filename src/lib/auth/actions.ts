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
  type ChangePasswordValues,
  type FormResult,
  loginSchema,
  type LoginValues,
  signupSchema,
  type SignupValues,
  updateProfileSchema,
  type UpdateProfileValues,
} from '@/lib/auth/validation';

export async function signup(input: SignupValues): Promise<FormResult<'email'>> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid details' };
  }

  const { email, name, password } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: 'An account with this email already exists', field: 'email' };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db
    .insert(users)
    .values({ email, name, passwordHash })
    .returning({ id: users.id });

  const user = result[0];
  if (!user) {
    return { error: 'Failed to create account. Please try again.' };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function login(input: LoginValues): Promise<FormResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid credentials' };
  }

  const { email, password } = parsed.data;

  const result = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const user = result[0];
  if (!user || !user.passwordHash) {
    return { error: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return { error: 'Invalid email or password' };
  }

  await createSession(user.id);
  redirect('/dashboard');
}

export async function logout() {
  await deleteSession();
  redirect('/login');
}

export async function updateProfile(input: UpdateProfileValues): Promise<FormResult> {
  const session = await verifySession();

  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid name' };
  }

  await db
    .update(users)
    .set({ name: parsed.data.name, updatedAt: new Date() })
    .where(eq(users.id, session.userId));

  return { success: true };
}

export async function changePassword(
  input: ChangePasswordValues,
): Promise<FormResult<'currentPassword'>> {
  const session = await verifySession();

  const parsed = changePasswordSchema.safeParse(input);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid password' };
  }

  const result = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  const user = result[0];
  if (!user?.passwordHash) {
    return { error: 'Cannot change password for OAuth accounts' };
  }

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return { error: 'Current password is incorrect', field: 'currentPassword' };
  }

  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db
    .update(users)
    .set({ passwordHash: newHash, updatedAt: new Date() })
    .where(eq(users.id, session.userId));

  return { success: true };
}

export async function deleteAccount() {
  const session = await verifySession();
  await db.delete(users).where(eq(users.id, session.userId));
  await deleteSession();
  redirect('/login');
}
