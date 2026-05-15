import { AppSidebar } from '@/components/layout/app-sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { getUser, verifySession } from '@/lib/auth/dal';
import { getRecentEvents } from '@/lib/event-queries';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, session] = await Promise.all([getUser(), verifySession()]);
  const recentEvents = await getRecentEvents(session.userId);

  return (
    <SidebarProvider className="!h-svh !min-h-0">
      <AppSidebar user={user} recentEvents={recentEvents} />
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">{children}</main>
    </SidebarProvider>
  );
}
