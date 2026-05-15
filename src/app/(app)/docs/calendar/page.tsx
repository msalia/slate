import { DocsPageContent } from '@/components/layout/docs-page';
import { getDocContent, getDocNav } from '@/lib/docs';

export default function CalendarDocsPage() {
  const { current, next, prev } = getDocNav('/docs/calendar');
  const content = getDocContent('calendar');

  return (
    <DocsPageContent
      title={current!.title}
      description={current!.description}
      content={content}
      prev={prev}
      next={next}
    />
  );
}
