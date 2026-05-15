'use client';

import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface SidePanelProps {
  children: React.ReactNode;
  className?: string;
  onClose: () => void;
  open: boolean;
  title?: string;
}

export function SidePanel({ children, className, onClose, open, title }: SidePanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className={cn('bg-background flex h-full w-96 flex-col border-l', className)}>
      <div className="flex h-14 items-center justify-between border-b px-4">
        {title && <h2 className="text-sm font-semibold">{title}</h2>}
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={onClose}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close panel</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">{children}</ScrollArea>
    </div>
  );
}
