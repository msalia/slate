import fs from 'fs';
import path from 'path';

export const docsOrder = [
  {
    description: 'Learn what Slate is and what it can do for your events.',
    href: '/docs',
    slug: 'introduction',
    title: 'Introduction',
  },
  {
    description: 'Create your first event and start building a schedule in under a minute.',
    href: '/docs/getting-started',
    slug: 'getting-started',
    title: 'Getting Started',
  },
  {
    description: 'Create, configure, and manage your events.',
    href: '/docs/events',
    slug: 'events',
    title: 'Events',
  },
  {
    description: 'Build and manage your presenter roster.',
    href: '/docs/presenters',
    slug: 'presenters',
    title: 'Presenters',
  },
  {
    description: 'Build your schedule with the visual calendar editor.',
    href: '/docs/calendar',
    slug: 'calendar',
    title: 'Calendar Editor',
  },
  {
    description: 'Publish your schedule and share it with attendees.',
    href: '/docs/publishing',
    slug: 'publishing',
    title: 'Publishing',
  },
];

export function getDocContent(slug: string): string {
  const filePath = path.join(process.cwd(), 'src/content/docs', `${slug}.md`);
  return fs.readFileSync(filePath, 'utf-8');
}

export function getDocNav(href: string) {
  const index = docsOrder.findIndex((d) => d.href === href);
  return {
    current: docsOrder[index],
    next: index < docsOrder.length - 1 ? docsOrder[index + 1] : null,
    prev: index > 0 ? docsOrder[index - 1] : null,
  };
}
