import { Search, Users } from 'lucide-react';

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
import { getUserPresenters } from '@/lib/event-queries';

import { AddPresenterDialog } from './add-presenter-dialog';
import { PresenterFilters } from './presenter-filters';
import { PresenterTable } from './presenter-table';

export default async function PresentersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await verifySession();
  const allPresenters = await getUserPresenters(session.userId);
  const { q } = await searchParams;

  const presenters = q
    ? allPresenters.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
    : allPresenters;

  return (
    <>
      <TopBar title="Presenters" breadcrumbs={[{ label: 'Presenters' }]} />
      <div className="flex-1 space-y-6 overflow-auto p-6">
        <PageHeader
          title="Presenters"
          description="Build your presenter roster. Presenters can be assigned to sessions across any of your events."
        >
          <AddPresenterDialog />
        </PageHeader>
        {allPresenters.length === 0 ? (
          <Empty className="h-full">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No presenters yet</EmptyTitle>
              <EmptyDescription>
                Add presenters to your roster so you can assign them to sessions.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <AddPresenterDialog />
            </EmptyContent>
          </Empty>
        ) : (
          <div className="space-y-5">
            <PresenterFilters />
            {presenters.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search />
                  </EmptyMedia>
                  <EmptyTitle>No results</EmptyTitle>
                  <EmptyDescription>
                    No presenters match your search. Try a different search or add a new presenter.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <AddPresenterDialog />
                </EmptyContent>
              </Empty>
            ) : (
              <PresenterTable presenters={presenters} />
            )}
          </div>
        )}
      </div>
    </>
  );
}
