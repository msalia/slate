'use client';

import { useActionState } from 'react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword, deleteAccount, updateProfile } from '@/lib/auth/actions';
import { getInitials } from '@/lib/utils';

export function ProfileForm({ user }: { user: { name: string; email: string } | null }) {
  const [state, action, pending] = useActionState(updateProfile, null);

  return (
    <form action={action}>
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
          {state?.message && (
            <p className={`text-sm ${state.success ? 'text-green-600' : 'text-destructive'}`}>
              {state.message}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={user?.name ?? ''} required />
            {state?.errors?.name && (
              <p className="text-destructive text-xs">{state.errors.name[0]}</p>
            )}
          </div>
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
  const [state, action, pending] = useActionState(changePassword, null);

  return (
    <form action={action}>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Update your password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {state?.message && (
            <p className={`text-sm ${state.success ? 'text-green-600' : 'text-destructive'}`}>
              {state.message}
            </p>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input id="currentPassword" name="currentPassword" type="password" required />
            {state?.errors?.currentPassword && (
              <p className="text-destructive text-xs">{state.errors.currentPassword[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="newPassword">New password</Label>
            <Input id="newPassword" name="newPassword" type="password" required />
            {state?.errors?.newPassword && (
              <p className="text-destructive text-xs">{state.errors.newPassword[0]}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input id="confirmPassword" name="confirmPassword" type="password" required />
            {state?.errors?.confirmPassword && (
              <p className="text-destructive text-xs">{state.errors.confirmPassword[0]}</p>
            )}
          </div>
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
