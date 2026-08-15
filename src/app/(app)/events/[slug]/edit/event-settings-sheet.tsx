'use client';

import { format } from 'date-fns';
import { Settings, Trash2 } from 'lucide-react';
import { Controller } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { TimezonePicker } from '@/components/ui/timezone-picker';
import { useActionForm } from '@/hooks/use-action-form';
import { deleteEvent, updateEvent } from '@/lib/event-actions';
import { updateEventSchema } from '@/lib/event-schema';
import { cn } from '@/lib/utils';

interface EventSettingsSheetProps {
  event: {
    description: string | null;
    endDate: Date;
    id: string;
    name: string;
    slug: string;
    startDate: Date;
    status: 'draft' | 'published';
    timezone: string;
  };
}

export function EventSettingsSheet({ event }: EventSettingsSheetProps) {
  const { form, formError, pending, submit, succeeded } = useActionForm({
    action: (values) => updateEvent(event.id, values),
    defaultValues: {
      description: event.description,
      endDate: format(event.endDate, 'yyyy-MM-dd'),
      name: event.name,
      startDate: format(event.startDate, 'yyyy-MM-dd'),
      timezone: event.timezone,
    },
    schema: updateEventSchema,
  });

  const { errors } = form.formState;

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this event? This cannot be undone.')) {
      return;
    }
    await deleteEvent(event.id);
  }

  return (
    <Sheet>
      <SheetTrigger className={cn(buttonVariants({ size: 'icon', variant: 'ghost' }))}>
        <Settings className="h-4 w-4" />
      </SheetTrigger>
      <SheetContent className="flex flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle>Event Settings</SheetTitle>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-auto px-4 pb-4">
          <form noValidate onSubmit={submit}>
            <FieldGroup>
              {formError && (
                <p role="alert" className="text-destructive text-sm">
                  {formError}
                </p>
              )}
              {succeeded && !formError && (
                <p role="status" className="text-sm text-green-600">
                  Event updated
                </p>
              )}

              <Field>
                <FieldLabel htmlFor="name">Name</FieldLabel>
                <Input id="name" {...form.register('name')} />
                <FieldError errors={[errors.name]} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field>
                  <FieldLabel htmlFor="startDate">Start</FieldLabel>
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
                  <FieldLabel htmlFor="endDate">End</FieldLabel>
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

              <Field>
                <FieldLabel>Timezone</FieldLabel>
                <Controller
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <TimezonePicker value={field.value} onChange={field.onChange} />
                  )}
                />
                <FieldError errors={[errors.timezone]} />
              </Field>

              <Field>
                <FieldLabel htmlFor="description">Description</FieldLabel>
                <Controller
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <Textarea
                      id="description"
                      rows={3}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <FieldError errors={[errors.description]} />
              </Field>

              <Button type="submit" disabled={pending} className="w-full">
                {pending ? 'Saving...' : 'Save changes'}
              </Button>
            </FieldGroup>
          </form>

          <Separator />

          <Button variant="destructive" className="w-full" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Delete event
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
