'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useActionForm } from '@/hooks/use-action-form';
import { login } from '@/lib/auth/actions';
import { loginSchema } from '@/lib/auth/validation';

export default function LoginPage() {
  const { form, formError, pending, submit } = useActionForm({
    action: login,
    defaultValues: { email: '', password: '' },
    schema: loginSchema,
  });

  const { errors } = form.formState;

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground text-sm">Sign in to your CueFlo account</p>
      </div>

      {formError && (
        <p role="alert" className="text-destructive text-sm">
          {formError}
        </p>
      )}

      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            {...form.register('email')}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" {...form.register('password')} />
          <FieldError errors={[errors.password]} />
        </Field>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in...' : 'Sign in'}
        </Button>
      </FieldGroup>

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
