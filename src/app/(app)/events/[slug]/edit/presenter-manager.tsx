'use client';

import { GripVertical, Plus } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPresenter } from '@/lib/presenter-actions';
import { getInitials } from '@/lib/utils';

interface PresenterManagerProps {
  presenters: { id: string; name: string; role: string | null }[];
}

export function PresenterManager({ presenters }: PresenterManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  async function handleAdd() {
    if (!name.trim()) {
      return;
    }
    await createPresenter(name.trim(), role.trim() || null);
    setName('');
    setRole('');
    setShowAdd(false);
  }

  return (
    <div className="space-y-3">
      <Label>Presenters</Label>
      <div className="space-y-1">
        {presenters.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
            <GripVertical className="text-muted-foreground/50 h-4 w-4 shrink-0 cursor-grab" />
            <Avatar className="h-8 w-8 shrink-0 rounded-full">
              <AvatarFallback className="rounded-full text-xs">
                {getInitials(p.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{p.name}</p>
              {p.role && <p className="text-muted-foreground truncate text-xs">{p.role}</p>}
            </div>
          </div>
        ))}
        {presenters.length === 0 && (
          <p className="text-muted-foreground py-3 text-center text-xs">No presenters yet</p>
        )}
      </div>

      {showAdd ? (
        <div className="space-y-2 rounded border p-3">
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            autoFocus
          />
          <Input
            placeholder="Role (optional)"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!name.trim()}>
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowAdd(false);
                setName('');
                setRole('');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowAdd(true)} className="w-full">
          <Plus className="h-3.5 w-3.5" />
          Add presenter
        </Button>
      )}
    </div>
  );
}
