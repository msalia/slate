'use client';

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useOptimistic, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addTrack, deleteTrack, reorderTracks, updateTrack } from '@/lib/track-actions';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  name: string;
  position: number;
}

interface TrackManagerProps {
  eventId: string;
  tracks: Track[];
}

function SortableTrack({ onDelete, track }: { onDelete: (trackId: string) => void; track: Track }) {
  const { attributes, isDragging, listeners, setNodeRef, transform, transition } = useSortable({
    id: track.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn('flex items-center gap-1', isDragging && 'relative z-10 opacity-80')}
      style={{ transform: CSS.Transform.toString(transform), transition }}
    >
      <button
        type="button"
        aria-label={`Reorder ${track.name}`}
        className="text-muted-foreground focus-visible:ring-ring cursor-grab rounded p-1 opacity-40 hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        defaultValue={track.name}
        className="flex-1"
        onBlur={(e) => {
          if (e.target.value !== track.name) {
            updateTrack(track.id, e.target.value);
          }
        }}
      />
      <Button
        variant="ghost"
        size="icon"
        className="aspect-square"
        onClick={() => onDelete(track.id)}
      >
        <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function TrackManager({ eventId, tracks }: TrackManagerProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Reordering shows immediately; the server confirms via revalidation.
  const [optimisticTracks, applyOrder] = useOptimistic(tracks, (_current, next: Track[]) => next);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleAdd() {
    if (!newName.trim()) {
      return;
    }
    await addTrack(eventId, newName.trim());
    setNewName('');
  }

  async function handleDelete(trackId: string) {
    const result = await deleteTrack(trackId);
    if (result?.error) {
      setError(result.error);
      setTimeout(() => setError(null), 3000);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const from = optimisticTracks.findIndex((t) => t.id === active.id);
    const to = optimisticTracks.findIndex((t) => t.id === over.id);
    if (from === -1 || to === -1) {
      return;
    }

    const next = arrayMove(optimisticTracks, from, to);
    startTransition(async () => {
      applyOrder(next);
      await reorderTracks(
        eventId,
        next.map((t) => t.id),
      );
    });
  }

  return (
    <div className="space-y-3">
      <Label>Tracks</Label>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="space-y-2">
        <DndContext
          // See calendar-editor.tsx: without a stable id, dnd-kit's generated
          // aria-describedby differs between server and client.
          id="tracks-dnd"
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={optimisticTracks.map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {optimisticTracks.map((track) => (
              <SortableTrack key={track.id} track={track} onDelete={handleDelete} />
            ))}
          </SortableContext>
        </DndContext>

        <div className="flex items-center gap-2">
          <Input
            placeholder="New track name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={handleAdd} disabled={!newName.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
