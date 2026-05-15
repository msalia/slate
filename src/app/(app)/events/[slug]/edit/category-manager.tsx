'use client';

import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { CATEGORY_COLORS, ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  addCategoryToEvent,
  createCategory,
  deleteCategory,
  removeCategoryFromEvent,
} from '@/lib/category-actions';

interface CategoryManagerProps {
  eventCategories: { id: string; name: string; color: string }[];
  eventId: string;
  userCategories: { id: string; name: string; color: string }[];
}

export function CategoryManager({
  eventCategories: assigned,
  eventId,
  userCategories,
}: CategoryManagerProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState<string>(CATEGORY_COLORS[0].value);
  const [showCreate, setShowCreate] = useState(false);

  const unassigned = userCategories.filter((c) => !assigned.some((a) => a.id === c.id));

  async function handleCreate() {
    if (!newName.trim()) {
      return;
    }
    const cat = await createCategory(newName.trim(), newColor);
    if (cat) {
      await addCategoryToEvent(eventId, cat.id);
    }
    setNewName('');
    setShowCreate(false);
  }

  return (
    <div className="space-y-3">
      <Label>Categories</Label>
      <div className="space-y-2">
        {assigned.length === 0 && (
          <p className="text-muted-foreground py-2 text-xs">
            No categories assigned. Click one below to add it.
          </p>
        )}
        {assigned.map((cat) => (
          <div key={cat.id} className="flex items-center gap-2">
            <GripVertical className="text-muted-foreground h-4 w-4 shrink-0 cursor-grab opacity-40 hover:opacity-70" />
            <div
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: `var(--${cat.color})` }}
            />
            <span className="flex-1 text-sm">{cat.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="aspect-square"
              onClick={() => removeCategoryFromEvent(eventId, cat.id)}
            >
              <Trash2 className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>

      {unassigned.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium">Available categories</p>
          <div className="flex flex-wrap gap-1.5">
            {unassigned.map((cat) => (
              <button
                key={cat.id}
                onClick={() => addCategoryToEvent(eventId, cat.id)}
                className="hover:bg-accent flex items-center gap-1.5 rounded border px-2 py-1 text-xs"
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: `var(--${cat.color})` }}
                />
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {showCreate ? (
        <div className="space-y-3 rounded border p-3">
          <Input
            placeholder="Category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            autoFocus
          />
          <ColorPicker value={newColor} onChange={setNewColor} />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleCreate} disabled={!newName.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowCreate(true)} className="w-full">
          <Plus className="h-3.5 w-3.5" />
          New category
        </Button>
      )}
    </div>
  );
}
