'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn, getInitials } from '@/lib/utils';

interface AvatarStackItem {
  imageUrl?: string;
  name: string;
}

interface AvatarStackProps {
  avatars: AvatarStackItem[];
  className?: string;
  max?: number;
  size?: 'sm' | 'md';
}

const sizeClasses = {
  md: 'h-8 w-8 text-xs',
  sm: 'h-6 w-6 text-[10px]',
};

export function AvatarStack({ avatars, className, max = 3, size = 'sm' }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;
  const overflowNames = avatars.slice(max).map((a) => a.name);

  return (
    <TooltipProvider delay={300}>
      <div className={cn('flex -space-x-2', className)}>
        {visible.map((avatar, i) => (
          <Tooltip key={i}>
            <TooltipTrigger
              className={cn(sizeClasses[size], 'ring-background aspect-square rounded-full ring-2')}
              render={
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    'ring-background aspect-square rounded-full ring-2',
                  )}
                />
              }
            >
              {avatar.imageUrl && (
                <AvatarImage src={avatar.imageUrl} alt={avatar.name} className="rounded-full" />
              )}
              <AvatarFallback className={cn(sizeClasses[size], 'rounded-full')}>
                {getInitials(avatar.name)}
              </AvatarFallback>
            </TooltipTrigger>
            <TooltipContent>{avatar.name}</TooltipContent>
          </Tooltip>
        ))}
        {overflow > 0 && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Avatar
                  className={cn(
                    sizeClasses[size],
                    'ring-background aspect-square rounded-full ring-2',
                  )}
                />
              }
            >
              <AvatarFallback
                className={cn(sizeClasses[size], 'bg-muted text-muted-foreground rounded-full')}
              >
                +{overflow}
              </AvatarFallback>
            </TooltipTrigger>
            <TooltipContent>{overflowNames.join(', ')}</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
