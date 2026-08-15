'use client';

import { Plus } from 'lucide-react';
import { useState } from 'react';

import { PresenterFields } from '@/components/presenters/presenter-fields';
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
import { useActionForm } from '@/hooks/use-action-form';
import { createPresenter } from '@/lib/presenter-actions';
import { presenterFormSchema, type PresenterFormValues } from '@/lib/presenter-schema';
import { cn } from '@/lib/utils';

const EMPTY: PresenterFormValues = { bio: null, name: '', role: null };

export function AddPresenterDialog({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  const { form, formError, pending, submit } = useActionForm({
    action: createPresenter,
    defaultValues: EMPTY,
    onSuccess: () => setOpen(false),
    resetOnSuccess: true,
    schema: presenterFormSchema,
  });

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
        <form noValidate onSubmit={submit} className="grid gap-4">
          {formError && (
            <p role="alert" className="text-destructive text-sm">
              {formError}
            </p>
          )}
          <PresenterFields form={form} idPrefix="add-presenter" />
          <DialogFooter>
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? 'Adding...' : 'Add presenter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
