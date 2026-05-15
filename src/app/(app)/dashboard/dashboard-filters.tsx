'use client';

import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DashboardFiltersProps {
  counts: { all: number; draft: number; published: number };
}

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
] as const;

export function DashboardFilters({ counts }: DashboardFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const currentStatus = searchParams.get('status') ?? 'all';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="bg-muted inline-flex items-center rounded-md p-0.5">
        {statusOptions.map((opt) => {
          const isActive = currentStatus === opt.value;
          const count = counts[opt.value];
          return (
            <button
              key={opt.value}
              onClick={() => updateParam('status', opt.value)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-sm px-3 py-1 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {opt.label}
              {count > 0 && opt.value !== 'all' && (
                <span
                  className={cn(
                    'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-xs',
                    isActive ? 'bg-muted text-muted-foreground' : 'bg-muted-foreground/20',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Filter events..."
          className="pl-9"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            updateParam('q', e.target.value);
          }}
        />
      </div>
    </div>
  );
}
