'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { deletePresenter, updatePresenter } from '@/lib/presenter-actions';
import { getInitials } from '@/lib/utils';

interface Presenter {
  bio: string | null;
  eventCount: number;
  id: string;
  name: string;
  role: string | null;
  sessionCount: number;
}

function EditPresenterDialog({
  onOpenChange,
  open,
  presenter,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  presenter: Presenter;
}) {
  const [name, setName] = useState(presenter.name);
  const [role, setRole] = useState(presenter.role ?? '');
  const [bio, setBio] = useState(presenter.bio ?? '');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    setPending(true);
    await updatePresenter(presenter.id, name, role || null, bio || null);
    setPending(false);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit presenter</DialogTitle>
          <DialogDescription>Update presenter details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="editName">Name</Label>
            <Input
              id="editName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="editRole">Role / title</Label>
            <Input
              id="editRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Engineering Lead"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="editBio">Bio</Label>
            <Textarea
              id="editBio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio (optional)"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending || !name.trim()}>
              {pending ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PresenterRow({ presenter }: { presenter: Presenter }) {
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete ${presenter.name}?`)) {
      return;
    }
    await deletePresenter(presenter.id);
  }

  return (
    <>
      <TableRow>
        <TableCell className="w-[50px]">
          <Avatar className="h-8 w-8 rounded-full">
            <AvatarFallback className="rounded-full text-xs">
              {getInitials(presenter.name)}
            </AvatarFallback>
          </Avatar>
        </TableCell>
        <TableCell className="w-[140px] font-medium">{presenter.name}</TableCell>
        <TableCell className="text-muted-foreground w-[120px]">{presenter.role ?? '—'}</TableCell>
        <TableCell className="text-muted-foreground">
          <p className="line-clamp-2 text-xs">{presenter.bio ?? '—'}</p>
        </TableCell>
        <TableCell className="text-muted-foreground w-[70px]">{presenter.eventCount}</TableCell>
        <TableCell className="text-muted-foreground w-[70px]">{presenter.sessionCount}</TableCell>
        <TableCell>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="aspect-square"
              onClick={() => setEditing(true)}
            >
              <Pencil className="text-muted-foreground h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="aspect-square" onClick={handleDelete}>
              <Trash2 className="text-destructive h-3.5 w-3.5" />
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <EditPresenterDialog open={editing} onOpenChange={setEditing} presenter={presenter} />
    </>
  );
}

export function PresenterTable({ presenters }: { presenters: Presenter[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]" />
            <TableHead className="w-[140px]">Name</TableHead>
            <TableHead className="w-[120px]">Role</TableHead>
            <TableHead>Bio</TableHead>
            <TableHead className="w-[70px]">Events</TableHead>
            <TableHead className="w-[70px]">Sessions</TableHead>
            <TableHead className="w-[80px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {presenters.map((presenter) => (
            <PresenterRow key={presenter.id} presenter={presenter} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
