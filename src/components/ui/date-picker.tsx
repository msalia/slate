'use client';

import { format } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { parseDateInput } from '@/lib/utils';

interface DatePickerProps {
  id?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** `yyyy-MM-dd`, always read and written in local time. */
  value: string;
}

export function DatePicker({ id, onChange, placeholder = 'Select date', value }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? parseDateInput(value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button id={id} variant="outline" className="w-full justify-between font-normal">
          {selected ? format(selected, 'PPP') : placeholder}
          <ChevronDownIcon className="text-muted-foreground h-4 w-4 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          captionLayout="dropdown"
          defaultMonth={selected}
          onSelect={(day) => {
            if (day) {
              onChange(format(day, 'yyyy-MM-dd'));
            }
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
