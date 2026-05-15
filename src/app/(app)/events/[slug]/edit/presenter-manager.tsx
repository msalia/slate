'use client';

import { GripVertical, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPresenter } from '@/lib/presenter-actions';
import { getInitials } from '@/lib/utils';

const MAX_VISIBLE = 7;

interface PresenterManagerProps {
  presenters: { id: string; name: string; role: string | null }[];
}

export function PresenterManager({ presenters }: PresenterManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) {return presenters;}
    const q = search.toLowerCase();
    return presenters.filter(
      (p) => p.name.toLowerCase().includes(q) || p.role?.toLowerCase().includes(q),
    );
  }, [presenters, search]);

  const visible = filtered.slice(0, MAX_VISIBLE);
  const remaining = filtered.length - MAX_VISIBLE;

  async function handleAdd() {
    if (!name.trim()) {return;}
    await createPresenter(name.trim(), role.trim() || null);
    setName('');
    setRole('');
    setShowAdd(false);
  }

  return (
    <div className="space-y-3">
      <Label>Presenters</Label>
      {presenters.length > MAX_VISIBLE && (
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
          <Input
            placeholder="Search presenters..."
            className="pl-8 text-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}
      <div className="space-y-1">
        {visible.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-md px-1 py-1.5">
            <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab opacity-40 hover:opacity-70" />
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
        {remaining > 0 && !search && (
          <p className="text-muted-foreground px-1 py-1 text-xs">
            +{remaining} more — use search to find
          </p>
        )}
        {presenters.length === 0 && (
          <p className="text-muted-foreground py-3 text-xs">No presenters yet</p>
        )}
        {search && filtered.length === 0 && (
          <p className="text-muted-foreground py-3 text-xs">No matches</p>
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
