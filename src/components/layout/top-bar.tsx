'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface TopBarProps {
  breadcrumbs?: { label: string; href?: string }[];
  children?: React.ReactNode;
  title: string;
}

export function TopBar({ breadcrumbs, children, title }: TopBarProps) {
  return (
    <header className="border-sidebar-border bg-background sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger />
      <div className="bg-border mx-1 h-4 w-px" />
      <Breadcrumb className="flex-1">
        <BreadcrumbList>
          {breadcrumbs?.flatMap((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const items = [
              <BreadcrumbItem key={`item-${i}`}>
                {crumb.href && !isLast ? (
                  <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>,
            ];
            if (!isLast) {
              items.push(<BreadcrumbSeparator key={`sep-${i}`} />);
            }
            return items;
          })}
          {!breadcrumbs && (
            <BreadcrumbItem>
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </header>
  );
}
