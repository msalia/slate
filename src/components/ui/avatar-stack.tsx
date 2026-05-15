import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

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

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

const sizeClasses = {
  md: 'h-8 w-8 text-xs',
  sm: 'h-6 w-6 text-[10px]',
};

export function AvatarStack({ avatars, className, max = 3, size = 'sm' }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((avatar, i) => (
        <Avatar key={i} className={cn(sizeClasses[size], 'border-background border-2')}>
          {avatar.imageUrl && <AvatarImage src={avatar.imageUrl} alt={avatar.name} />}
          <AvatarFallback className={sizeClasses[size]}>{getInitials(avatar.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <Avatar className={cn(sizeClasses[size], 'border-background border-2')}>
          <AvatarFallback className={cn(sizeClasses[size], 'bg-muted text-muted-foreground')}>
            +{overflow}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
