# Publishing

When your schedule is ready, publish it to make it accessible to attendees via a shareable link.

## How to Publish

1. Open your event in the calendar editor.
2. Click the **gear icon** in the top-right to open Event Settings.
3. Click the **Publish** button. The status will change from "Draft" to "Published".
4. A **shareable link** appears — copy it and send it to your attendees.

## The Attendee View

When attendees open the shareable link, they see a read-only version of your schedule:

- **Desktop** — A calendar grid layout mirroring the editor, with session cards showing title, time, presenters, and category color-coding.
- **Mobile** — A chronological list grouped by time slot, with track badges on each session.

## Filtering

Attendees can filter the schedule by:

- **Track** — Show only sessions from a specific track.
- **Category** — Show only sessions of a specific type.
- **Presenter** — Show only sessions featuring a specific presenter.

Filters are combinable and shown as removable pills above the schedule.

## Happening Now

Sessions whose time range includes the current time are highlighted with a "Happening Now" indicator. This updates automatically every minute using client-side time — no WebSocket or real-time server connection required.

## Unpublishing

You can unpublish an event at any time from Event Settings. When unpublished, the shareable link returns a 404 page. Attendees who previously accessed the schedule will no longer be able to view it.

## Making Changes After Publishing

Publishing doesn't freeze your schedule. You can continue editing sessions, tracks, categories, and presenters while the event is published. Changes are reflected immediately — attendees see the latest version when they refresh the page.

## Calendar Export

Both organizers and attendees can export the schedule:

- **Full Schedule** — Download a single .ics file containing all sessions. Import it into Google Calendar, Apple Calendar, or Outlook.
- **Individual Sessions** — Each session has an "Add to Calendar" button that generates a single-event .ics file.
