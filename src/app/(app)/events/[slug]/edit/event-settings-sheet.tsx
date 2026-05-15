'use client';

import { Settings, Trash2 } from 'lucide-react';
import { useActionState, useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { TimezonePicker } from '@/components/ui/timezone-picker';
import { deleteEvent, updateEvent } from '@/lib/event-actions';
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
  const updateWithId = updateEvent.bind(null, event.id);
  const [state, action, pending] = useActionState(updateWithId, null);
  const [timezone, setTimezone] = useState(event.timezone);

  const startDate = new Date(event.startDate).toISOString().split('T')[0];
  const endDate = new Date(event.endDate).toISOString().split('T')[0];

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
          <form action={action} className="grid gap-4">
            {state?.message && (
              <p className={`text-sm ${state.success ? 'text-green-600' : 'text-destructive'}`}>
                {state.message}
              </p>
            )}
            <div className="grid gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={event.name} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="startDate">Start</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={startDate}
                  required
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="endDate">End</Label>
                <Input id="endDate" name="endDate" type="date" defaultValue={endDate} required />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label>Timezone</Label>
              <TimezonePicker value={timezone} onChange={setTimezone} name="timezone" />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={event.description ?? ''}
                rows={3}
              />
            </div>
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Saving...' : 'Save changes'}
            </Button>
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
