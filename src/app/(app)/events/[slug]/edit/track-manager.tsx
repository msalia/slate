'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { addTrack, deleteTrack, updateTrack } from '@/lib/track-actions';

interface TrackManagerProps {
  eventId: string;
  tracks: { id: string; name: string; position: number }[];
}

export function TrackManager({ eventId, tracks }: TrackManagerProps) {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-3">
      <Label>Tracks</Label>
      {error && <p className="text-destructive text-xs">{error}</p>}
      <div className="space-y-2">
        {tracks.map((track) => (
          <div key={track.id} className="flex items-center gap-2">
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
              onClick={() => handleDelete(track.id)}
            >
              <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
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
