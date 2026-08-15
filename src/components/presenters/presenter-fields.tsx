'use client';

import { type UseFormReturn } from 'react-hook-form';

import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { type PresenterFormValues } from '@/lib/presenter-schema';

/** The name/role/bio trio, shared by the add and edit dialogs. */
export function PresenterFields({
  form,
  idPrefix,
}: {
  form: UseFormReturn<PresenterFormValues>;
  idPrefix: string;
}) {
  const { errors } = form.formState;

  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-name`}>Name</FieldLabel>
        <Input id={`${idPrefix}-name`} autoFocus {...form.register('name')} />
        <FieldError errors={[errors.name]} />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-role`}>Role / title</FieldLabel>
        <Input
          id={`${idPrefix}-role`}
          placeholder="e.g. Engineering Lead"
          value={form.watch('role') ?? ''}
          onChange={(e) => form.setValue('role', e.target.value || null)}
        />
        <FieldError errors={[errors.role]} />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${idPrefix}-bio`}>Bio</FieldLabel>
        <Textarea
          id={`${idPrefix}-bio`}
          placeholder="Short bio (optional)"
          rows={2}
          value={form.watch('bio') ?? ''}
          onChange={(e) => form.setValue('bio', e.target.value || null)}
        />
        <FieldError errors={[errors.bio]} />
      </Field>
    </FieldGroup>
  );
}
