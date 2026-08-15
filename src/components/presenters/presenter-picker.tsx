'use client';

import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface Presenter {
  id: string;
  name: string;
  role?: string | null;
}

interface PresenterPickerProps {
  name?: string;
  onChange: (ids: string[]) => void;
  presenters: Presenter[];
  value: string[];
}

export function PresenterPicker({
  name = 'presenterIds',
  onChange,
  presenters,
  value,
}: PresenterPickerProps) {
  const [open, setOpen] = useState(false);

  const selected = value
    .map((id) => presenters.find((p) => p.id === id))
    .filter((p): p is Presenter => Boolean(p));

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="grid gap-1.5">
      {value.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            <span className="text-muted-foreground truncate">
              {selected.length === 0
                ? 'Add presenters'
                : `${selected.length} presenter${selected.length === 1 ? '' : 's'}`}
            </span>
            <ChevronsUpDown className="text-muted-foreground ml-2 h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search presenters..." />
            <CommandList>
              <CommandEmpty>No presenter found.</CommandEmpty>
              <CommandGroup>
                {presenters.map((presenter) => (
                  <CommandItem
                    key={presenter.id}
                    value={presenter.name}
                    onSelect={() => toggle(presenter.id)}
                  >
                    <Check
                      className={cn(
                        'h-4 w-4',
                        value.includes(presenter.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    <span className="flex-1 truncate">{presenter.name}</span>
                    {presenter.role && (
                      <span className="text-muted-foreground truncate text-xs">
                        {presenter.role}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((presenter) => (
            <Badge key={presenter.id} variant="secondary" className="gap-1 pr-1">
              {presenter.name}
              <button
                type="button"
                onClick={() => toggle(presenter.id)}
                className="hover:bg-background/60 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Remove {presenter.name}</span>
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
