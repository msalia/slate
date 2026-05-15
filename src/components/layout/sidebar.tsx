'use client';

import { Calendar, LayoutDashboard, LogOut, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { logout } from '@/lib/auth/actions';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/events', icon: Calendar, label: 'Events' },
  { href: '/presenters', icon: Users, label: 'Presenters' },
];

const bottomItems = [{ href: '/settings', icon: Settings, label: 'Settings' }];

interface SidebarProps {
  user: { name: string; email: string } | null;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="border-sidebar-border bg-sidebar flex h-full w-60 flex-col border-r">
      <div className="flex h-14 items-center px-5">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-lg">
            <Calendar className="h-4 w-4" />
          </div>
          <span className="text-sidebar-foreground text-lg font-semibold">Slate</span>
        </Link>
      </div>

      <Separator className="bg-sidebar-border" />

      <ScrollArea className="flex-1 px-3 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="px-3 pb-3">
        <nav className="flex flex-col gap-1">
          {bottomItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground',
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Separator className="bg-sidebar-border my-3" />
        {user && (
          <div className="mb-3 flex items-center gap-3 px-3">
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-[10px]">{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-sidebar-foreground truncate text-sm font-medium">{user.name}</p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}
        <div className="flex items-center justify-between px-3">
          <span className="text-sidebar-foreground/50 text-xs">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
