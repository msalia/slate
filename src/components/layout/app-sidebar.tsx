'use client';

import {
  BookOpen,
  Calendar,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MoreHorizontal,
  Palette,
  Settings,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { logout } from '@/lib/auth/actions';
import { getInitials } from '@/lib/utils';

import { ThemeToggle } from './theme-toggle';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/presenters', icon: Users, label: 'Presenters' },
];

const docItems = [
  { href: '/docs', label: 'Introduction' },
  { href: '/docs/getting-started', label: 'Getting Started' },
  { href: '/docs/events', label: 'Events' },
  { href: '/docs/presenters', label: 'Presenters' },
  { href: '/docs/calendar', label: 'Calendar Editor' },
  { href: '/docs/publishing', label: 'Publishing' },
];

interface RecentEvent {
  id: string;
  name: string;
  slug: string;
  status: 'draft' | 'published';
}

interface AppSidebarProps {
  recentEvents: RecentEvent[];
  user: { name: string; email: string } | null;
}

export function AppSidebar({ recentEvents, user }: AppSidebarProps) {
  const pathname = usePathname();
  const isDocsActive = pathname.startsWith('/docs');
  const [docsOpen, setDocsOpen] = useState(isDocsActive);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1">
          <Calendar className="h-5 w-5 shrink-0" />
          <span className="font-semibold group-data-[collapsible=icon]:hidden">Slate</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      render={<Link href={item.href} />}
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={false}
                  tooltip="Documentation"
                  onClick={() => setDocsOpen(!docsOpen)}
                >
                  <BookOpen />
                  <span>Documentation</span>
                  <ChevronRight
                    className={`ml-auto h-4 w-4 transition-transform ${docsOpen ? 'rotate-90' : ''}`}
                  />
                </SidebarMenuButton>
                {docsOpen && (
                  <SidebarMenuSub>
                    {docItems.map((item) => (
                      <SidebarMenuSubItem key={item.href}>
                        <SidebarMenuSubButton
                          isActive={pathname === item.href}
                          render={<Link href={item.href} />}
                        >
                          {item.label}
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {recentEvents.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Events</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {recentEvents.map((event) => {
                  const isActive = pathname === `/events/${event.slug}/edit`;
                  return (
                    <SidebarMenuItem key={event.id}>
                      <SidebarMenuButton
                        isActive={isActive}
                        tooltip={event.name}
                        render={<Link href={`/events/${event.slug}/edit`} />}
                      >
                        <Calendar />
                        <span>{event.name}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="All events" render={<Link href="/dashboard" />}>
                    <MoreHorizontal />
                    <span>More</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={() => logout()}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Settings"
              isActive={pathname === '/settings'}
              render={<Link href="/settings" />}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="text-sidebar-foreground flex w-full items-center gap-2 overflow-hidden rounded-md px-2 py-1.5 text-sm outline-none group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Palette className="h-4 w-4 shrink-0" />
              <span className="flex-1 truncate group-data-[collapsible=icon]:hidden">Theme</span>
              <div className="group-data-[collapsible=icon]:hidden">
                <ThemeToggle />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
        {user && (
          <>
            <SidebarSeparator />
            <div className="flex items-center gap-3 px-2 py-1.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <Avatar className="h-8 w-8 shrink-0 rounded-md">
                <AvatarFallback className="rounded-md text-xs">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium">{user.name}</span>
                <span className="text-muted-foreground truncate text-xs">{user.email}</span>
              </div>
            </div>
          </>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
