'use client';

import {
  closestCorners,
  DndContext,
  type DragEndEvent,
  type DragMoveEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useCallback, useOptimistic, useState, useTransition } from 'react';

import {
  CalendarGrid,
  DRAG_SNAP_MINUTES,
  type GridSession,
  HOUR_HEIGHT,
  SessionCardBody,
  sessionCardClasses,
  sessionGeometry,
  UNASSIGNED_DROPPABLE,
} from '@/components/calendar/calendar-grid';
import {
  type EditorSession,
  emptySession,
  SessionEditor,
} from '@/components/calendar/session-editor';
import { SidePanel } from '@/components/layout/side-panel';
import { Button } from '@/components/ui/button';
import { moveSession } from '@/lib/session-actions';
import { findConflictingSession, shiftSessionTimes } from '@/lib/session-layout';
import { cn, formatTimeRange } from '@/lib/utils';

interface CalendarEditorProps {
  categories: { color: string; id: string; name: string }[];
  endDate: Date;
  eventId: string;
  presenters: { id: string; name: string; role?: string | null }[];
  sessions: GridSession[];
  startDate: Date;
  tracks: { id: string; name: string; position: number }[];
}

interface PendingMove {
  end: Date;
  id: string;
  start: Date;
  trackId: string | null;
}

/** What the last move replaced, so it can be put back. */
interface UndoEntry {
  end: Date;
  id: string;
  start: Date;
  title: string;
  trackId: string | null;
}

export function CalendarEditor({
  categories,
  endDate,
  eventId,
  presenters,
  sessions,
  startDate,
  tracks,
}: CalendarEditorProps) {
  const [editing, setEditing] = useState<EditorSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [undo, setUndo] = useState<UndoEntry | null>(null);
  const [, startTransition] = useTransition();

  const [activeSession, setActiveSession] = useState<GridSession | null>(null);
  const [preview, setPreview] = useState<{ conflict: boolean; end: Date; start: Date } | null>(
    null,
  );

  // Moves land instantly; the optimistic layer is discarded once the action's
  // revalidation delivers fresh props (or when it fails and we bail out).
  const [optimisticSessions, applyMove] = useOptimistic(
    sessions,
    (current: GridSession[], move: PendingMove) =>
      current.map((session) =>
        session.id === move.id
          ? { ...session, endTime: move.end, startTime: move.start, trackId: move.trackId }
          : session,
      ),
  );

  const close = useCallback(() => setEditing(null), []);

  const sensors = useSensors(
    // A few pixels of travel keeps the handle clickable without starting a drag.
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  /** Where a drag would land: the same helpers the server re-checks with. */
  function resolveDrop(session: GridSession, deltaY: number, overId: string | null) {
    const minutes = (deltaY / HOUR_HEIGHT) * 60;
    const { end, start } = shiftSessionTimes(
      session.startTime,
      session.endTime,
      minutes,
      DRAG_SNAP_MINUTES,
    );
    const trackId = overId === null || overId === UNASSIGNED_DROPPABLE ? session.trackId : overId;
    const conflict = findConflictingSession(optimisticSessions, {
      end,
      excludeId: session.id,
      start,
      trackId,
    });
    return { conflict, end, start, trackId };
  }

  function handleDragStart(event: DragStartEvent) {
    setError(null);
    setActiveSession((event.active.data.current?.session as GridSession) ?? null);
  }

  function handleDragMove(event: DragMoveEvent) {
    const session = event.active.data.current?.session as GridSession | undefined;
    if (!session) {
      return;
    }
    const { conflict, end, start } = resolveDrop(
      session,
      event.delta.y,
      event.over ? String(event.over.id) : null,
    );
    setPreview({ conflict: Boolean(conflict), end, start });
  }

  function handleDragEnd(event: DragEndEvent) {
    const session = event.active.data.current?.session as GridSession | undefined;
    setActiveSession(null);
    setPreview(null);

    if (!session) {
      return;
    }

    const { conflict, end, start, trackId } = resolveDrop(
      session,
      event.delta.y,
      event.over ? String(event.over.id) : null,
    );

    const unchanged =
      start.getTime() === session.startTime.getTime() && trackId === session.trackId;
    if (unchanged) {
      return;
    }

    if (conflict) {
      setError(`Can't move "${session.title}" — it would overlap "${conflict.title}"`);
      return;
    }

    commitMove(
      { end, id: session.id, start, trackId },
      {
        end: session.endTime,
        id: session.id,
        start: session.startTime,
        title: session.title,
        trackId: session.trackId,
      },
    );
  }

  function commitMove(move: PendingMove, previous: UndoEntry) {
    setError(null);
    startTransition(async () => {
      applyMove(move);
      const result = await moveSession(move.id, {
        endTime: move.end.toISOString(),
        startTime: move.start.toISOString(),
        trackId: move.trackId,
      });

      if (result.error) {
        setError(result.error);
        setUndo(null);
        return;
      }
      setUndo(previous);
    });
  }

  function handleUndo() {
    if (!undo) {
      return;
    }
    setUndo(null);
    commitMove({ end: undo.end, id: undo.id, start: undo.start, trackId: undo.trackId }, undo);
  }

  const overlayGeometry = activeSession ? sessionGeometry(activeSession) : null;

  return (
    <div className="flex h-full">
      <div className="relative min-w-0 flex-1 overflow-hidden">
        <DndContext
          // Explicit id: dnd-kit otherwise derives its aria-describedby from a
          // module-global counter, which starts fresh on the client and so
          // disagrees with the server render.
          id="calendar-dnd"
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragMove={handleDragMove}
          onDragEnd={handleDragEnd}
          onDragCancel={() => {
            setActiveSession(null);
            setPreview(null);
          }}
        >
          <CalendarGrid
            tracks={tracks}
            sessions={optimisticSessions}
            categories={categories}
            startDate={startDate}
            endDate={endDate}
            selectedSessionId={editing?.id ?? null}
            pendingRange={
              editing && !editing.id
                ? { end: editing.endTime, start: editing.startTime, trackId: editing.trackId }
                : null
            }
            onSlotClick={(trackId, start) => setEditing(emptySession(trackId, start))}
            onDragCreate={(trackId, start, end) =>
              setEditing({ ...emptySession(trackId, start), endTime: end })
            }
            onSessionClick={(session) =>
              setEditing({
                categoryId: session.categoryId,
                description: session.description,
                endTime: session.endTime,
                id: session.id,
                isBreak: session.isBreak,
                presenterIds: session.presenters.map((p) => p.id),
                startTime: session.startTime,
                title: session.title,
                trackId: session.trackId,
              })
            }
          />

          <DragOverlay dropAnimation={null}>
            {activeSession && overlayGeometry && (
              <div
                data-testid="drag-overlay"
                className={cn(
                  sessionCardClasses(activeSession, false),
                  'bg-card w-[200px] p-3 shadow-lg ring-2',
                  preview?.conflict ? 'ring-destructive' : 'ring-primary',
                )}
                style={{ height: `${overlayGeometry.height}px` }}
              >
                <SessionCardBody
                  session={
                    preview
                      ? { ...activeSession, endTime: preview.end, startTime: preview.start }
                      : activeSession
                  }
                  categories={categories}
                  height={overlayGeometry.height}
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>

        {(error || undo) && (
          // The strip spans the grid, so it must not swallow clicks on the
          // sessions underneath it — only the banner itself is interactive.
          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-20 flex justify-center px-4">
            <div
              role="status"
              className={cn(
                'bg-background pointer-events-auto flex items-center gap-3 rounded-lg border px-3 py-2 text-sm shadow-lg',
                error && 'border-destructive/40',
              )}
            >
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                <span className="text-muted-foreground">
                  Moved “{undo!.title}” to {formatTimeRange(undo!.start, undo!.end)}
                </span>
              )}
              {error ? (
                <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                  Dismiss
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={handleUndo}>
                  Undo
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <SidePanel
        open={editing !== null}
        onClose={close}
        title={editing?.id ? 'Edit session' : 'New session'}
      >
        {editing && (
          <SessionEditor
            // getTime() rather than toISOString(): never throws, so a bad date
            // shows an empty form instead of crashing the whole editor.
            key={editing.id ?? `new-${editing.startTime.getTime()}-${editing.trackId}`}
            eventId={eventId}
            session={editing}
            tracks={tracks}
            categories={categories}
            presenters={presenters}
            onDone={close}
          />
        )}
      </SidePanel>
    </div>
  );
}
