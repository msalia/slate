import { Calendar, Plus } from 'lucide-react';

import { TopBar } from '@/components/layout/top-bar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function DashboardPage() {
  return (
    <>
      <TopBar title="Dashboard">
        <Button size="default">
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </TopBar>
      <div className="flex-1 overflow-auto p-6">
        <EmptyState
          icon={<Calendar className="h-12 w-12" />}
          title="No events yet"
          description="Create your first event to get started with building a schedule."
          action={
            <Button size="default">
              <Plus className="h-4 w-4" />
              Create Event
            </Button>
          }
        />
      </div>
    </>
  );
}
