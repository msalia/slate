import { Calendar, Search } from 'lucide-react';

import { PageHeader } from '@/components/layout/page-header';
import { TopBar } from '@/components/layout/top-bar';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { verifySession } from '@/lib/auth/dal';
import { getEventsWithSessionCount } from '@/lib/event-queries';

import { CreateEventDialog } from './create-event-dialog';
import { DashboardFilters } from './dashboard-filters';
import { EventCard } from './event-card';

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await verifySession();
  const allEvents = await getEventsWithSessionCount(session.userId);
  const { q, status } = await searchParams;

  const events = allEvents.filter((event) => {
    if (status && status !== 'all' && event.status !== status) {
      return false;
    }
    if (q && !event.name.toLowerCase().includes(q.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <>
      <TopBar title="Events" breadcrumbs={[{ label: 'Events' }]} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <PageHeader
          title="Events"
          description="Create, manage, and publish your event schedules. Each event has its own tracks, sessions, and presenters."
        >
          <CreateEventDialog />
        </PageHeader>
        {allEvents.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>No events yet</EmptyTitle>
              <EmptyDescription>
                Create your first event to get started with building a schedule.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <CreateEventDialog />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-5">
            <DashboardFilters
              counts={{
                all: allEvents.length,
                draft: allEvents.filter((e) => e.status === 'draft').length,
                published: allEvents.filter((e) => e.status === 'published').length,
              }}
            />
            {events.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>No results</EmptyTitle>
                  <EmptyDescription>
                    No events match your filters. Try a different search or create a new event.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <CreateEventDialog />
                </EmptyContent>
              </Empty>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
