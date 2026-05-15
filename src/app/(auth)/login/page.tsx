'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { login } from '@/lib/auth/actions';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <form action={action} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your Slate account</p>
      </div>
      {state?.message && <p className="text-destructive text-sm">{state.message}</p>}
      <div className="grid gap-4">
        <div className="grid gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" required />
          {state?.errors?.email && (
            <p className="text-destructive text-xs">{state.errors.email[0]}</p>
          )}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
          {state?.errors?.password && (
            <p className="text-destructive text-xs">{state.errors.password[0]}</p>
          )}
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in...' : 'Sign in'}
        </Button>
      </div>
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="text-foreground hover:text-primary underline underline-offset-4"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
