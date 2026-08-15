'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { AvatarStack } from '@/components/ui/avatar-stack';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  cn,
  formatTimeRange,
  getCalendarDays,
  getHoursBetween,
  isSameDay,
  snapToInterval,
  timeToMinutes,
} from '@/lib/utils';

export const START_HOUR = 0;
export const END_HOUR = 24;
export const HOUR_HEIGHT = 60;
/** Snap for click-to-create. */
export const SLOT_SNAP_MINUTES = 15;
/** Snap while dragging, per the plan's 5-minute grid. */
export const DRAG_SNAP_MINUTES = 5;
/** Droppable id for the column holding sessions with no track. */
export const UNASSIGNED_DROPPABLE = 'unassigned';

const LABEL_HOURS = getHoursBetween(START_HOUR + 1, END_HOUR - 1);
const GRID_HOURS = getHoursBetween(START_HOUR, END_HOUR - 1);
/** Pointer travel before a press on empty grid counts as a range drag. */
const DRAG_CREATE_THRESHOLD_PX = 4;

function formatHour(hour: number): string {
  if (hour === 0 || hour === 24) {
    return '12 AM';
  }
  if (hour === 12) {
    return '12 PM';
  }
  if (hour < 12) {
    return `${hour} AM`;
  }
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

export interface GridSession {
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
  onDragCreate?: (trackId: string | null, start: Date, end: Date) => void;
  onSessionClick?: (session: GridSession) => void;
  onSlotClick?: (trackId: string | null, start: Date) => void;
  /** Range currently being edited but not yet saved — drawn as a dashed outline. */
  pendingRange?: { end: Date; start: Date; trackId: string | null } | null;
  /** The session open in the side panel, highlighted with a ring. */
  selectedSessionId?: string | null;
  sessions: GridSession[];
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

/** Pixel offset and height for a session, from its start time and duration. */
export function sessionGeometry(session: { endTime: Date; startTime: Date }) {
  const startMin = timeToMinutes(session.startTime);
  const endMin = timeToMinutes(session.endTime);
  return {
    height: Math.max((endMin - startMin) * (HOUR_HEIGHT / 60), 28),
    top: (startMin - START_HOUR * 60) * (HOUR_HEIGHT / 60),
  };
}

export function SessionCardBody({
  categories,
  height,
  session,
}: {
  categories: Category[];
  height: number;
  session: GridSession;
}) {
  const category = categories.find((c) => c.id === session.categoryId);

  // Decide what fits based on pixel height
  const showLargeCategory = height >= 50;
  const showTime = height >= 44;
  const showDescription = height >= 80 && !!session.description;
  const showPresenters = height >= 100 && session.presenters.length > 0;
  const descLines = height >= 120 ? 3 : 2;

  return (
    <>
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
    </>
  );
}

export function sessionCardClasses(session: GridSession, hasCategoryColor: boolean) {
  return cn(
    'flex flex-col overflow-hidden rounded-lg border text-left text-xs shadow-sm backdrop-blur-sm',
    session.isBreak && 'bg-muted/50 border-dashed',
    !hasCategoryColor && !session.isBreak && 'bg-card',
  );
}

function SessionCard({
  categories,
  onClick,
  selected,
  session,
}: {
  categories: Category[];
  onClick?: () => void;
  selected?: boolean;
  session: GridSession;
}) {
  const { attributes, isDragging, listeners, setNodeRef } = useDraggable({
    data: { session },
    id: session.id,
  });

  const category = categories.find((c) => c.id === session.categoryId);
  const colorStyle = category?.color && CATEGORY_BG[category.color];
  const { height, top } = sessionGeometry(session);
  const showLargeCategory = height >= 50;

  return (
    <div
      ref={setNodeRef}
      data-testid="session-card"
      data-session-id={session.id}
      className={cn(
        'group/session absolute inset-x-1.5',
        sessionCardClasses(session, Boolean(colorStyle)),
        // No transition mid-drag — it would lag behind the pointer.
        isDragging ? 'opacity-40' : 'transition-[top,height] duration-150 ease-out',
        selected && 'ring-primary z-10 ring-2 ring-offset-1',
      )}
      style={{
        backgroundColor: colorStyle ? colorStyle.bg : undefined,
        borderColor: colorStyle ? colorStyle.border : undefined,
        height: `${height}px`,
        top: `${top}px`,
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          // Don't let the click fall through to the column's create handler.
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          'hover:ring-foreground/40 flex h-full w-full cursor-pointer flex-col overflow-hidden rounded-lg p-3 text-left hover:shadow-md',
          showLargeCategory ? 'justify-start' : 'justify-center',
        )}
      >
        <SessionCardBody session={session} categories={categories} height={height} />
      </button>

      <button
        type="button"
        data-testid="session-drag-handle"
        aria-label={`Move ${session.title}`}
        className="text-muted-foreground hover:bg-background/80 focus-visible:ring-ring absolute top-1 right-1 cursor-grab rounded p-1 opacity-0 transition-opacity group-hover/session:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:outline-none active:cursor-grabbing"
        {...listeners}
        {...attributes}
      >
        <svg viewBox="0 0 10 16" className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true">
          <circle cx="2" cy="2" r="1.5" />
          <circle cx="8" cy="2" r="1.5" />
          <circle cx="2" cy="8" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="2" cy="14" r="1.5" />
          <circle cx="8" cy="14" r="1.5" />
        </svg>
      </button>
    </div>
  );
}

/** Ticks once a minute; the server snapshot is null so hydration can't mismatch. */
function subscribeToMinute(onChange: () => void) {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
}

const getMinuteSnapshot = () => Math.floor(Date.now() / 60_000);
const getServerMinuteSnapshot = () => null;

function NowIndicator() {
  // Reading the clock during render would make server and client disagree.
  // useSyncExternalStore renders nothing until after hydration, then ticks.
  const minute = useSyncExternalStore(
    subscribeToMinute,
    getMinuteSnapshot,
    getServerMinuteSnapshot,
  );

  if (minute === null) {
    return null;
  }

  const min = timeToMinutes(new Date(minute * 60_000));
  if (min < START_HOUR * 60 || min > END_HOUR * 60) {
    return null;
  }
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

interface DraftRange {
  fromY: number;
  toY: number;
  trackId: string | null;
}

function TrackColumn({
  categories,
  children,
  draft,
  label,
  muted,
  onPointerDownCapture,
  onPointerMove,
  onPointerUp,
  onSessionClick,
  pending,
  selectedSessionId,
  sessions,
  trackId,
}: {
  categories: Category[];
  children?: React.ReactNode;
  draft: DraftRange | null;
  label: string;
  muted?: boolean;
  onPointerDownCapture: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
  onSessionClick?: (session: GridSession) => void;
  pending?: { height: number; top: number } | null;
  selectedSessionId?: string | null;
  sessions: GridSession[];
  trackId: string | null;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: trackId ?? UNASSIGNED_DROPPABLE });

  const draftTop = draft ? Math.min(draft.fromY, draft.toY) : 0;
  const draftHeight = draft ? Math.abs(draft.toY - draft.fromY) : 0;

  return (
    <div className="min-w-[200px] flex-1 border-r last:border-r-0">
      <div className="bg-background sticky top-0 z-10 flex h-10 items-center border-b px-3">
        <span className={cn('truncate text-sm font-medium', muted && 'text-muted-foreground')}>
          {label}
        </span>
      </div>
      <div
        ref={setNodeRef}
        data-testid="track-column"
        data-track-id={trackId ?? UNASSIGNED_DROPPABLE}
        className={cn('relative cursor-copy', isOver && 'bg-accent/30')}
        style={{ height: `${(END_HOUR - START_HOUR) * HOUR_HEIGHT}px` }}
        onPointerDownCapture={onPointerDownCapture}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
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
            style={{ top: `${(hour - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2}px` }}
          />
        ))}
        {sessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            categories={categories}
            selected={session.id === selectedSessionId}
            onClick={() => onSessionClick?.(session)}
          />
        ))}
        {pending && !draft && (
          <div
            data-testid="pending-range"
            className="border-primary bg-primary/5 pointer-events-none absolute inset-x-1.5 rounded-lg border-2 border-dashed"
            style={{ height: `${pending.height}px`, top: `${pending.top}px` }}
          />
        )}
        {draft && draftHeight > 0 && (
          <div
            data-testid="draft-range"
            className="border-primary bg-primary/10 pointer-events-none absolute inset-x-1.5 rounded-lg border-2 border-dashed"
            style={{ height: `${draftHeight}px`, top: `${draftTop}px` }}
          />
        )}
        {children}
      </div>
    </div>
  );
}

export function CalendarGrid({
  categories,
  endDate,
  onDragCreate,
  onSessionClick,
  onSlotClick,
  pendingRange,
  selectedSessionId,
  sessions,
  startDate,
  tracks,
}: CalendarGridProps) {
  const days = getCalendarDays(
    startDate,
    endDate,
    sessions.map((s) => s.startTime),
  );
  const [selectedDay, setSelectedDay] = useState(0);
  // getCalendarDays always yields at least one day, but never hand an undefined
  // day downstream — it produces Invalid Dates that surface far from the cause.
  const currentDay = days[selectedDay] ?? days[0] ?? new Date();
  const scrollRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);
  const [draft, setDraft] = useState<DraftRange | null>(null);
  const pressOrigin = useRef<{ trackId: string | null; y: number } | null>(null);

  const daySessions = sessions.filter((s) => isSameDay(s.startTime, currentDay));

  // Auto-scroll to show sessions or default to 9am
  useEffect(() => {
    if (hasScrolled.current || !scrollRef.current) {
      return;
    }
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

  /** Converts a y offset inside a column into a snapped time on the current day. */
  function timeAtOffset(y: number, snapMinutes = SLOT_SNAP_MINUTES) {
    const minutes = (y / HOUR_HEIGHT) * 60 + START_HOUR * 60;
    const time = new Date(currentDay);
    time.setHours(0, Math.round(minutes), 0, 0);
    return snapToInterval(time, snapMinutes);
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, trackId: string | null) {
    // Presses that start on a card belong to the card, not to range-drawing.
    if ((e.target as HTMLElement).closest('[data-testid="session-card"]')) {
      return;
    }
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    pressOrigin.current = { trackId, y };
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const origin = pressOrigin.current;
    if (!origin) {
      return;
    }
    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    if (!draft && Math.abs(y - origin.y) < DRAG_CREATE_THRESHOLD_PX) {
      return;
    }
    setDraft({ fromY: origin.y, toY: y, trackId: origin.trackId });
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
    const origin = pressOrigin.current;
    pressOrigin.current = null;

    if (!origin) {
      return;
    }

    const y = e.clientY - e.currentTarget.getBoundingClientRect().top;
    const dragged = draft && Math.abs(y - origin.y) >= DRAG_CREATE_THRESHOLD_PX;
    setDraft(null);

    if (dragged && onDragCreate) {
      const from = timeAtOffset(Math.min(origin.y, y));
      const to = timeAtOffset(Math.max(origin.y, y));
      // A range that snaps down to nothing is a click in disguise.
      if (to.getTime() > from.getTime()) {
        onDragCreate(origin.trackId, from, to);
        return;
      }
    }

    onSlotClick?.(origin.trackId, timeAtOffset(origin.y));
  }

  const unassigned = daySessions.filter((s) => !s.trackId && !s.isBreak);

  const pendingOnThisDay =
    pendingRange && isSameDay(pendingRange.start, currentDay)
      ? sessionGeometry({ endTime: pendingRange.end, startTime: pendingRange.start })
      : null;

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

      <div ref={scrollRef} data-testid="calendar-scroll" className="flex-1 overflow-auto">
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
            tracks.map((track) => (
              <TrackColumn
                key={track.id}
                trackId={track.id}
                label={track.name}
                categories={categories}
                sessions={daySessions.filter((s) => s.trackId === track.id)}
                draft={draft?.trackId === track.id ? draft : null}
                pending={pendingRange?.trackId === track.id ? pendingOnThisDay : null}
                selectedSessionId={selectedSessionId}
                onSessionClick={onSessionClick}
                onPointerDownCapture={(e) => handlePointerDown(e, track.id)}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              >
                <NowIndicator />
              </TrackColumn>
            ))
          )}

          {unassigned.length > 0 && (
            <TrackColumn
              trackId={null}
              label="Unassigned"
              muted
              categories={categories}
              sessions={unassigned}
              draft={draft?.trackId === null ? draft : null}
              pending={pendingRange?.trackId === null ? pendingOnThisDay : null}
              selectedSessionId={selectedSessionId}
              onSessionClick={onSessionClick}
              onPointerDownCapture={(e) => handlePointerDown(e, null)}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export { type Category, type Track };
