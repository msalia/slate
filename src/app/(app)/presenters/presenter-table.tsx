'use client';

import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { PresenterFields } from '@/components/presenters/presenter-fields';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useActionForm } from '@/hooks/use-action-form';
import { deletePresenter, updatePresenter } from '@/lib/presenter-actions';
import { presenterFormSchema } from '@/lib/presenter-schema';
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
  onOpenChange: (open: boolean) => void;
  open: boolean;
  presenter: Presenter;
}) {
  const { form, formError, pending, submit } = useActionForm({
    action: (values) => updatePresenter(presenter.id, values),
    defaultValues: { bio: presenter.bio, name: presenter.name, role: presenter.role },
    onSuccess: () => onOpenChange(false),
    schema: presenterFormSchema,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit presenter</DialogTitle>
          <DialogDescription>Update presenter details.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className="grid gap-4">
          {formError && (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          )}
          <PresenterFields form={form} idPrefix={`edit-presenter-${presenter.id}`} />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending}>
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
