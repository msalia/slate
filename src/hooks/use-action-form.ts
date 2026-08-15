'use client';

import type { z } from 'zod';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useTransition } from 'react';
import {
  type DefaultValues,
  type FieldValues,
  type Path,
  type Resolver,
  useForm,
  type UseFormReturn,
} from 'react-hook-form';

import { type FormResult } from '@/lib/auth/validation';

interface UseActionFormOptions<TValues extends FieldValues> {
  action: (values: TValues) => Promise<FormResult | void>;
  defaultValues: DefaultValues<TValues>;
  onSuccess?: () => void;
  /** Clears the fields after a successful submit — for password forms. */
  resetOnSuccess?: boolean;
  schema: z.ZodTypeAny;
}

interface UseActionFormReturn<TValues extends FieldValues> {
  form: UseFormReturn<TValues>;
  /** Server-side error with no field of its own. */
  formError: string | null;
  pending: boolean;
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  succeeded: boolean;
}

/**
 * Wires a zod schema to react-hook-form and a server action.
 *
 * The schema validates on the client for immediate feedback and again inside
 * the action, since a client can send anything. A returned `field` is attached
 * to that input; anything else surfaces as a form-level message.
 */
export function useActionForm<TValues extends FieldValues>({
  action,
  defaultValues,
  onSuccess,
  resetOnSuccess,
  schema,
}: UseActionFormOptions<TValues>): UseActionFormReturn<TValues> {
  const [pending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);
  const [succeeded, setSucceeded] = useState(false);

  const form = useForm<TValues>({
    defaultValues,
    // zodResolver can't line its generics up with a caller-supplied schema;
    // the schema and TValues are kept in step by the call sites.
    resolver: zodResolver(schema) as Resolver<TValues>,
  });

  const submit = form.handleSubmit((values) => {
    setFormError(null);
    setSucceeded(false);

    return new Promise<void>((resolve) => {
      startTransition(async () => {
        // A redirecting action never returns; Next throws to navigate instead.
        const result = await action(values);

        if (result?.error) {
          if (result.field) {
            form.setError(result.field as Path<TValues>, { message: result.error });
          } else {
            setFormError(result.error);
          }
          resolve();
          return;
        }

        setSucceeded(true);
        if (resetOnSuccess) {
          form.reset(defaultValues);
        }
        onSuccess?.();
        resolve();
      });
    });
  });

  return { form, formError, pending, submit, succeeded };
}
