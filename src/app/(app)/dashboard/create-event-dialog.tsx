'use client';

import { Plus } from 'lucide-react';
import { useActionState, useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createEvent } from '@/lib/event-actions';
import { cn } from '@/lib/utils';

export function CreateEventDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(createEvent, null);

  const today = new Date().toISOString().split('T')[0];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants(), className)}>
        <Plus className="h-4 w-4" />
        Create Event
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
          <DialogDescription>Set up the basics — you can edit everything later.</DialogDescription>
        </DialogHeader>
        <form action={action} className="grid gap-4">
          {state?.message && <p className="text-destructive text-sm">{state.message}</p>}
          <div className="grid gap-1.5">
            <Label htmlFor="name">Event name</Label>
            <Input id="name" name="name" placeholder="My Conference 2026" required autoFocus />
            {state?.errors?.name && (
              <p className="text-destructive text-xs">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input id="startDate" name="startDate" type="date" defaultValue={today} required />
              {state?.errors?.startDate && (
                <p className="text-destructive text-xs">{state.errors.startDate[0]}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input id="endDate" name="endDate" type="date" defaultValue={today} required />
              {state?.errors?.endDate && (
                <p className="text-destructive text-xs">{state.errors.endDate[0]}</p>
              )}
            </div>
          </div>
          <input
            type="hidden"
            name="timezone"
            value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Creating...' : 'Create event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
