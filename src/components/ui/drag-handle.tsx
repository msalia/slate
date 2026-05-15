import { GripVertical } from 'lucide-react';

import { cn } from '@/lib/utils';

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className }: DragHandleProps) {
  return (
    <div
      className={cn(
        'text-muted-foreground/50 hover:text-muted-foreground flex cursor-grab items-center active:cursor-grabbing',
        className,
      )}
    >
      <GripVertical className="h-4 w-4" />
    </div>
  );
}
