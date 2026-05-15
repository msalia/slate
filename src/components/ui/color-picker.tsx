'use client';

import { cn } from '@/lib/utils';

const CATEGORY_COLORS = [
  { name: 'Blue', value: 'category-blue' },
  { name: 'Green', value: 'category-green' },
  { name: 'Orange', value: 'category-orange' },
  { name: 'Purple', value: 'category-purple' },
  { name: 'Pink', value: 'category-pink' },
  { name: 'Teal', value: 'category-teal' },
  { name: 'Red', value: 'category-red' },
  { name: 'Yellow', value: 'category-yellow' },
] as const;

interface ColorPickerProps {
  className?: string;
  onChange?: (value: string) => void;
  value?: string;
}

export function ColorPicker({ className, onChange, value }: ColorPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {CATEGORY_COLORS.map((color) => (
        <button
          key={color.value}
          type="button"
          title={color.name}
          onClick={() => onChange?.(color.value)}
          className={cn(
            'h-7 w-7 rounded-full transition-all hover:scale-110',
            value === color.value && 'ring-ring ring-offset-background ring-2 ring-offset-2',
          )}
          style={{ backgroundColor: `var(--${color.value})` }}
        />
      ))}
    </div>
  );
}

export { CATEGORY_COLORS };
