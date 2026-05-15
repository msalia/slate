import { notFound } from 'next/navigation';

import { TopBar } from '@/components/layout/top-bar';
import { Separator } from '@/components/ui/separator';
import { verifySession } from '@/lib/auth/dal';
import {
  getEventCategories,
  getEventTracks,
  getEventWithDetails,
  getUserCategories,
  getUserPresenters,
} from '@/lib/event-queries';

import { CategoryManager } from './category-manager';
import { EventSettingsSheet } from './event-settings-sheet';
import { PresenterManager } from './presenter-manager';
import { PublishCard } from './publish-card';
import { TrackManager } from './track-manager';

export default async function EventEditorPage({ params }: PageProps<'/events/[slug]/edit'>) {
  const { slug } = await params;
  const session = await verifySession();
  const event = await getEventWithDetails(slug, session.userId);
  if (!event) {
    notFound();
  }

  const [eventTracks, assignedCategories, allCategories, allPresenters] = await Promise.all([
    getEventTracks(event.id),
    getEventCategories(event.id),
    getUserCategories(session.userId),
    getUserPresenters(session.userId),
  ]);

  return (
    <>
      <TopBar
        title={event.name}
        breadcrumbs={[{ href: '/dashboard', label: 'Events' }, { label: event.name }]}
      >
        <EventSettingsSheet event={event} />
      </TopBar>
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto p-6">
          <div className="text-muted-foreground flex h-full items-center justify-center">
            Calendar editor coming in Phase 7
          </div>
        </div>
        <div className="w-72 space-y-6 overflow-auto border-l p-4">
          <PublishCard
            eventId={event.id}
            publishToken={event.publishToken}
            slug={event.slug}
            status={event.status}
          />
          <Separator />
          <TrackManager eventId={event.id} tracks={eventTracks} />
          <Separator />
          <CategoryManager
            eventId={event.id}
            eventCategories={assignedCategories}
            userCategories={allCategories}
          />
          <Separator />
          <PresenterManager presenters={allPresenters} />
        </div>
      </div>
    </>
  );
}
