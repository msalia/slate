'use client';

import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useActionForm } from '@/hooks/use-action-form';
import { createEvent } from '@/lib/event-actions';
import { createEventSchema } from '@/lib/event-schema';
import { cn } from '@/lib/utils';

export function CreateEventDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  // Local date, not toISOString() — that is UTC and can read as the wrong day.
  const today = format(new Date(), 'yyyy-MM-dd');

  const { form, formError, pending, submit } = useActionForm({
    action: createEvent,
    defaultValues: {
      endDate: today,
      name: '',
      startDate: today,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    schema: createEventSchema,
  });

  const { errors } = form.formState;

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
        <form noValidate onSubmit={submit}>
          <FieldGroup>
            {formError && (
              <p role="alert" className="text-destructive text-sm">
                {formError}
              </p>
            )}

            <Field>
              <FieldLabel htmlFor="name">Event name</FieldLabel>
              <Input
                id="name"
                placeholder="My Conference 2026"
                autoFocus
                {...form.register('name')}
              />
              <FieldError errors={[errors.name]} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="startDate">Start date</FieldLabel>
                <Controller
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <DatePicker id="startDate" value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError errors={[errors.startDate]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="endDate">End date</FieldLabel>
                <Controller
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <DatePicker id="endDate" value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError errors={[errors.endDate]} />
              </Field>
            </div>

            <DialogFooter>
              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? 'Creating...' : 'Create event'}
              </Button>
            </DialogFooter>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
}
