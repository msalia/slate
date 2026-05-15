'use client';

import { useEffect, useRef, useState } from 'react';

import { AvatarStack } from '@/components/ui/avatar-stack';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  cn,
  formatTimeRange,
  getDaysBetween,
  getHoursBetween,
  isSameDay,
  timeToMinutes,
} from '@/lib/utils';

const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_HEIGHT = 60;
const LABEL_HOURS = getHoursBetween(START_HOUR + 1, END_HOUR - 1);
const GRID_HOURS = getHoursBetween(START_HOUR, END_HOUR - 1);

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) {return '12 AM';}
  if (hour === 12) {return '12 PM';}
  if (hour < 12) {return `${hour} AM`;}
  return `${hour - 12} PM`;
}

interface Track {
  id: string;
  name: string;
  position: number;
}

interface SessionPresenter {
  id: string;
  name: string;
}

interface Session {
  categoryId: string | null;
  description: string | null;
  endTime: Date;
  id: string;
  isBreak: boolean;
  position: number;
  presenters: SessionPresenter[];
  startTime: Date;
  title: string;
  trackId: string | null;
}

interface Category {
  color: string;
  id: string;
  name: string;
}

interface CalendarGridProps {
  categories: Category[];
  endDate: Date;
  onSessionClick?: (session: Session) => void;
  sessions: Session[];
  startDate: Date;
  tracks: Track[];
}

const CATEGORY_BG: Record<string, { bg: string; border: string }> = {
  'category-blue': { bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.2)' },
  'category-green': { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' },
  'category-orange': { bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.2)' },
  'category-pink': { bg: 'rgba(236,72,153,0.1)', border: 'rgba(236,72,153,0.2)' },
  'category-purple': { bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.2)' },
  'category-red': { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' },
  'category-teal': { bg: 'rgba(20,184,166,0.1)', border: 'rgba(20,184,166,0.2)' },
  'category-yellow': { bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.2)' },
};

function SessionCard({
  categories,
  onClick,
  session,
}: {
  categories: Category[];
  onClick?: () => void;
  session: Session;
}) {
  const category = categories.find((c) => c.id === session.categoryId);
  const startMin = timeToMinutes(session.startTime);
  const endMin = timeToMinutes(session.endTime);
  const durationMin = endMin - startMin;
  const top = (startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60);
  const height = Math.max(durationMin * (HOUR_HEIGHT / 60), 28);

  // Decide what fits based on pixel height
  const showLargeCategory = height >= 50;
  const showTime = height >= 44;
  const showDescription = height >= 80 && !!session.description;
  const showPresenters = height >= 100 && session.presenters.length > 0;
  const descLines = height >= 120 ? 3 : 2;

  const colorStyle = category?.color && CATEGORY_BG[category.color];
  const bgColor = colorStyle ? colorStyle.bg : undefined;
  const borderColor = colorStyle ? colorStyle.border : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group/session hover:ring-foreground/40 absolute inset-x-1.5 flex cursor-grab flex-col overflow-hidden rounded-lg border text-left text-xs shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-md active:cursor-grabbing',
        showLargeCategory ? 'justify-start p-3' : 'justify-center p-3',
        session.isBreak && 'bg-muted/50 border-dashed',
        !colorStyle && !session.isBreak && 'bg-card shadow-sm',
      )}
      style={{
        backgroundColor: bgColor,
        borderColor: borderColor,
        height: `${height}px`,
        top: `${top}px`,
      }}
    >
      <div className={cn('flex gap-2', showLargeCategory ? 'items-start' : 'items-center')}>
        {category && showLargeCategory && (
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] leading-none font-bold text-white"
            style={{ backgroundColor: `var(--${category.color})` }}
          >
            {category.name[0].toUpperCase()}
          </div>
        )}
        {category && !showLargeCategory && (
          <div
            className="h-2.5 w-2.5 shrink-0 rounded-full"
            style={{ backgroundColor: `var(--${category.color})` }}
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate leading-tight font-semibold">{session.title}</p>
          {showTime && (
            <p className="text-muted-foreground mt-0.5">
              {formatTimeRange(session.startTime, session.endTime)}
            </p>
          )}
        </div>
      </div>
      {showDescription && (
        <p
          className={cn(
            'text-muted-foreground mt-1.5',
            descLines >= 3 ? 'line-clamp-3' : 'line-clamp-2',
          )}
        >
          {session.description}
        </p>
      )}
      {showPresenters && (
        <div className="mt-2">
          <AvatarStack size="sm" avatars={session.presenters} max={4} />
        </div>
      )}
    </button>
  );
}

function NowIndicator() {
  const now = new Date();
  const min = timeToMinutes(now);
  if (min < START_HOUR * 60 || min > END_HOUR * 60) {return null;}
  const top = (min - START_HOUR * 60) * (HOUR_HEIGHT / 60);

  return (
    <div className="pointer-events-none absolute right-0 left-0 z-10" style={{ top: `${top}px` }}>
      <div className="flex items-center">
        <div className="bg-destructive h-2.5 w-2.5 rounded-full" />
        <div className="bg-destructive h-px flex-1" />
      </div>
    </div>
  );
}

export function CalendarGrid({
  categories,
  endDate,
  onSessionClick,
  sessions,
  startDate,
  tracks,
}: CalendarGridProps) {
  const days = getDaysBetween(startDate, endDate);
  const [selectedDay, setSelectedDay] = useState(0);
  const currentDay = days[selectedDay] || days[0];
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const daySessions = sessions.filter((s) => isSameDay(s.startTime, currentDay));

  // Auto-scroll to show sessions or default to 9am
  useEffect(() => {
    if (hasScrolled.current || !scrollRef.current) {return;}
    hasScrolled.current = true;

    let scrollToHour = 9;

    if (daySessions.length > 0) {
      const earliestMin = Math.min(...daySessions.map((s) => timeToMinutes(s.startTime)));
      scrollToHour = Math.max(0, Math.floor(earliestMin / 60) - 1);
    }

    scrollRef.current.scrollTop = scrollToHour * HOUR_HEIGHT;
  }, [daySessions]);

  const dayFmt = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });

  return (
    <div className="flex h-full flex-col">
      {days.length > 1 && (
        <div className="shrink-0 border-b px-4 py-2">
          <Tabs value={String(selectedDay)} onValueChange={(v) => setSelectedDay(Number(v))}>
            <TabsList>
              {days.map((day, i) => (
                <TabsTrigger key={i} value={String(i)}>
                  {dayFmt.format(day)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="flex min-w-fit">
          <div className="bg-background sticky left-0 z-10 w-20 shrink-0 border-r">
            <div className="h-10" />
            <div
              className="relative"
              style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
            >
              {LABEL_HOURS.map((hour) => (
                <div
                  key={hour}
                  className="text-muted-foreground absolute right-2 flex -translate-y-1/2 items-center text-xs"
                  style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                >
                  {formatHour(hour)}
                </div>
              ))}
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center p-12 text-sm">
              Add tracks in the sidebar to get started
            </div>
          ) : (
            tracks.map((track) => {
              const trackSessions = daySessions.filter((s) => s.trackId === track.id);

              return (
                <div key={track.id} className="min-w-[200px] flex-1 border-r last:border-r-0">
                  <div className="bg-background sticky top-0 z-10 flex h-10 items-center border-b px-3">
                    <span className="truncate text-sm font-medium">{track.name}</span>
                  </div>
                  <div
                    className="relative"
                    style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
                  >
                    {GRID_HOURS.map((hour) => (
                      <div
                        key={hour}
                        className="border-border/40 absolute right-0 left-0 border-b"
                        style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                      />
                    ))}
                    {GRID_HOURS.map((hour) => (
                      <div
                        key={`half-${hour}`}
                        className="border-border/20 absolute right-0 left-0 border-b"
                        style={{
                          top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px`,
                        }}
                      />
                    ))}
                    {trackSessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        categories={categories}
                        onClick={() => onSessionClick?.(session)}
                      />
                    ))}
                    <NowIndicator />
                  </div>
                </div>
              );
            })
          )}

          {daySessions.filter((s) => !s.trackId && !s.isBreak).length > 0 && (
            <div className="min-w-[200px] flex-1 border-r last:border-r-0">
              <div className="bg-background sticky top-0 z-10 flex h-10 items-center border-b px-3">
                <span className="text-muted-foreground truncate text-sm font-medium">
                  Unassigned
                </span>
              </div>
              <div
                className="relative"
                style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
              >
                {GRID_HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="border-border/40 absolute right-0 left-0 border-b"
                    style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT}px` }}
                  />
                ))}
                {daySessions
                  .filter((s) => !s.trackId && !s.isBreak)
                  .map((session) => (
                    <SessionCard
                      key={session.id}
                      session={session}
                      categories={categories}
                      onClick={() => onSessionClick?.(session)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
