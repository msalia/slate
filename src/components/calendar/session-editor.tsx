'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ChevronDownIcon, Trash2 } from 'lucide-react';
import { useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { PresenterPicker } from '@/components/presenters/presenter-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { createSession, deleteSession, updateSession } from '@/lib/session-actions';
import { sessionFormSchema, type SessionFormValues } from '@/lib/session-schema';
import { addMinutes, parseDateInput, toTimeInputValue } from '@/lib/utils';

/** Base UI Select can't hold `null`, so "unassigned" travels as this sentinel. */
const NONE = 'none';

const TIME_INPUT_CLASS =
  'appearance-none bg-background [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none';

export interface EditorSession {
  categoryId: string | null;
  description: string | null;
  endTime: Date;
  id: string | null;
  isBreak: boolean;
  presenterIds: string[];
  startTime: Date;
  title: string;
  trackId: string | null;
}

interface SessionEditorProps {
  categories: { color: string; id: string; name: string }[];
  eventId: string;
  onDone: () => void;
  presenters: { id: string; name: string; role?: string | null }[];
  session: EditorSession;
  tracks: { id: string; name: string }[];
}

/** A blank session anchored to the slot the organizer clicked. */
export function emptySession(trackId: string | null, startTime: Date): EditorSession {
  const start = Number.isNaN(startTime.getTime()) ? new Date() : startTime;
  return {
    categoryId: null,
    description: null,
    endTime: addMinutes(start, 60),
    id: null,
    isBreak: false,
    presenterIds: [],
    startTime: start,
    title: '',
    trackId,
  };
}

function toDefaults(session: EditorSession): SessionFormValues {
  return {
    categoryId: session.categoryId,
    date: format(session.startTime, 'yyyy-MM-dd'),
    description: session.description,
    endTime: toTimeInputValue(session.endTime),
    isBreak: session.isBreak,
    presenterIds: session.presenterIds,
    startTime: toTimeInputValue(session.startTime),
    title: session.title,
    trackId: session.trackId,
  };
}

export function SessionEditor({
  categories,
  eventId,
  onDone,
  presenters,
  session,
  tracks,
}: SessionEditorProps) {
  const isNew = session.id === null;
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const form = useForm<SessionFormValues>({
    defaultValues: toDefaults(session),
    resolver: zodResolver(sessionFormSchema),
  });

  const { errors } = form.formState;

  function onSubmit(values: SessionFormValues) {
    setServerError(null);
    startTransition(async () => {
      const result = isNew
        ? await createSession(eventId, values)
        : await updateSession(session.id!, values);

      if (result.error) {
        setServerError(result.error);
        return;
      }
      onDone();
    });
  }

  function handleDelete() {
    if (!session.id || !confirm('Delete this session? This cannot be undone.')) {
      return;
    }
    startTransition(async () => {
      const result = await deleteSession(session.id!);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      onDone();
    });
  }

  const selectedDate = parseDateInput(form.watch('date'));

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input id="title" autoFocus {...form.register('title')} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="session-date">Date</FieldLabel>
          <Controller
            control={form.control}
            name="date"
            render={({ field }) => (
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="session-date"
                    className="w-full justify-between font-normal"
                  >
                    {field.value ? format(selectedDate, 'PPP') : 'Select date'}
                    <ChevronDownIcon className="text-muted-foreground h-4 w-4 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    captionLayout="dropdown"
                    defaultMonth={selectedDate}
                    onSelect={(day) => {
                      if (day) {
                        field.onChange(format(day, 'yyyy-MM-dd'));
                      }
                      setDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          <FieldError errors={[errors.date]} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <FieldLabel htmlFor="startTime">Start</FieldLabel>
            <Input
              id="startTime"
              type="time"
              step={300}
              className={TIME_INPUT_CLASS}
              {...form.register('startTime')}
            />
            <FieldError errors={[errors.startTime]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="endTime">End</FieldLabel>
            <Input
              id="endTime"
              type="time"
              step={300}
              className={TIME_INPUT_CLASS}
              {...form.register('endTime')}
            />
            <FieldError errors={[errors.endTime]} />
          </Field>
        </div>

        <Field>
          <FieldLabel htmlFor="trackId">Track</FieldLabel>
          <Controller
            control={form.control}
            name="trackId"
            render={({ field }) => (
              <Select
                value={field.value ?? NONE}
                onValueChange={(value) => field.onChange(value === NONE ? null : value)}
                items={{
                  [NONE]: 'No track',
                  ...Object.fromEntries(tracks.map((track) => [track.id, track.name])),
                }}
              >
                <SelectTrigger id="trackId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Tracks</SelectLabel>
                    <SelectItem value={NONE}>No track</SelectItem>
                    {tracks.map((track) => (
                      <SelectItem key={track.id} value={track.id}>
                        {track.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.trackId]} />
        </Field>

        <Field>
          <FieldLabel htmlFor="categoryId">Category</FieldLabel>
          <Controller
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <Select
                value={field.value ?? NONE}
                onValueChange={(value) => field.onChange(value === NONE ? null : value)}
                items={{
                  [NONE]: 'No category',
                  ...Object.fromEntries(categories.map((category) => [category.id, category.name])),
                }}
              >
                <SelectTrigger id="categoryId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Categories</SelectLabel>
                    <SelectItem value={NONE}>No category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: `var(--${category.color})` }}
                          />
                          {category.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.categoryId]} />
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

        <Field>
          <FieldLabel>Presenters</FieldLabel>
          <Controller
            control={form.control}
            name="presenterIds"
            render={({ field }) => (
              <PresenterPicker
                presenters={presenters}
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="isBreak">Break</FieldLabel>
          <Controller
            control={form.control}
            name="isBreak"
            render={({ field }) => (
              <Switch id="isBreak" checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </Field>

        {serverError && (
          <p role="alert" className="text-destructive text-sm">
            {serverError}
          </p>
        )}

        <div className="flex gap-2">
          <Button type="submit" disabled={pending} className="flex-1">
            {pending ? 'Saving...' : isNew ? 'Create session' : 'Save changes'}
          </Button>
          <Button type="button" variant="ghost" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        </div>

        {!isNew && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
            className="w-full"
          >
            <Trash2 className="h-4 w-4" />
            Delete session
          </Button>
        )}
      </FieldGroup>
    </form>
  );
}
