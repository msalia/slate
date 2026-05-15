'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

import { cn } from '@/lib/utils';

const subscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();

  if (!mounted) {
    return <div className="bg-muted h-7 w-14 rounded-md" />;
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <div className="bg-muted inline-flex h-7 items-center rounded-md p-0.5">
      <button
        onClick={() => setTheme('light')}
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors',
          !isDark ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Sun className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={cn(
          'inline-flex h-6 w-6 items-center justify-center rounded-sm transition-colors',
          isDark ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Moon className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
