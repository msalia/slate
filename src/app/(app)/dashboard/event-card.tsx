import { Calendar, Clock, Columns3 } from 'lucide-react';
import Link from 'next/link';

import { AvatarStack } from '@/components/ui/avatar-stack';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateRange, timeAgo } from '@/lib/utils';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    startDate: Date;
    endDate: Date;
    status: 'draft' | 'published';
    sessionCount: number;
    trackCount: number;
    createdAt: Date;
    presenters: { name: string }[];
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.slug}/edit`}>
      <Card className="flex h-full min-h-[180px] flex-col transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-1">{event.name}</CardTitle>
            <Badge variant={event.status === 'published' ? 'default' : 'secondary'}>
              {event.status === 'published' ? 'Published' : 'Draft'}
            </Badge>
          </div>
          {event.description && (
            <p className="text-muted-foreground line-clamp-2 text-xs">{event.description}</p>
          )}
        </CardHeader>
        <CardContent className="mt-auto">
          <div className="flex flex-col gap-3">
            {event.presenters.length > 0 && <AvatarStack size="md" avatars={event.presenters} />}
            <div className="text-muted-foreground flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDateRange(event.startDate, event.endDate)}
              </span>
            </div>
            <div className="text-muted-foreground flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {event.sessionCount} {event.sessionCount === 1 ? 'session' : 'sessions'}
                </span>
                <span className="flex items-center gap-1">
                  <Columns3 className="h-3 w-3" />
                  {event.trackCount} {event.trackCount === 1 ? 'track' : 'tracks'}
                </span>
              </div>
              <span>Created {timeAgo(event.createdAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
