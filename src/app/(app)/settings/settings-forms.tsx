'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useActionForm } from '@/hooks/use-action-form';
import { changePassword, deleteAccount, updateProfile } from '@/lib/auth/actions';
import { changePasswordSchema, updateProfileSchema } from '@/lib/auth/validation';
import { getInitials } from '@/lib/utils';

function StatusMessage({ error, success }: { error: string | null; success: boolean }) {
  if (error) {
    return (
      <p role="alert" className="text-destructive text-sm">
        {error}
      </p>
    );
  }
  if (success) {
    return (
      <p role="status" className="text-sm text-green-600">
        Saved
      </p>
    );
  }
  return null;
}

export function ProfileForm({ user }: { user: { email: string; name: string } | null }) {
  const { form, formError, pending, submit, succeeded } = useActionForm({
    action: updateProfile,
    defaultValues: { name: user?.name ?? '' },
    schema: updateProfileSchema,
  });

  return (
    <form noValidate onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your display name</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-muted-foreground text-xs">{user.email}</p>
              </div>
            </div>
          )}
          <StatusMessage error={formError} success={succeeded} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              {/* defaultValue as well as RHF's default: register only fills the
                  input after hydration, which would otherwise flash empty. */}
              <Input id="name" defaultValue={user?.name ?? ''} {...form.register('name')} />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Save changes'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function PasswordForm() {
  const { form, formError, pending, submit, succeeded } = useActionForm({
    action: changePassword,
    defaultValues: { confirmPassword: '', currentPassword: '', newPassword: '' },
    resetOnSuccess: true,
    schema: changePasswordSchema,
  });

  const { errors } = form.formState;

  return (
    <form noValidate onSubmit={submit}>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <StatusMessage error={formError} success={succeeded} />
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="currentPassword">Current password</FieldLabel>
              <Input
                id="currentPassword"
                type="password"
                autoComplete="current-password"
                {...form.register('currentPassword')}
              />
              <FieldError errors={[errors.currentPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="newPassword">New password</FieldLabel>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('newPassword')}
              />
              <FieldError errors={[errors.newPassword]} />
            </Field>

            <Field>
              <FieldLabel htmlFor="confirmPassword">Confirm new password</FieldLabel>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register('confirmPassword')}
              />
              <FieldError errors={[errors.confirmPassword]} />
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={pending}>
            {pending ? 'Changing...' : 'Change password'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function DeleteAccountSection() {
  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardFooter>
        <form action={deleteAccount}>
          <Button type="submit" variant="destructive">
            Delete account
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
