'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { Button, buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createPresenter } from '@/lib/presenter-actions';
import { cn } from '@/lib/utils';

export function AddPresenterDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      return;
    }
    setPending(true);
    await createPresenter(name.trim(), role.trim() || null, bio.trim() || null);
    setName('');
    setRole('');
    setBio('');
    setPending(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={cn(buttonVariants(), className)}>
        <Plus className="h-4 w-4" />
        Add Presenter
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add presenter</DialogTitle>
          <DialogDescription>Add a presenter to your roster.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="presenterName">Name</Label>
            <Input
              id="presenterName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="presenterRole">Role / title</Label>
            <Input
              id="presenterRole"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Engineering Lead"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="presenterBio">Bio</Label>
            <Textarea
              id="presenterBio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio (optional)"
              rows={2}
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending || !name.trim()}>
              {pending ? 'Adding...' : 'Add presenter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
