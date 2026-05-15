import { DocsPageContent } from '@/components/layout/docs-page';
import { getDocContent, getDocNav } from '@/lib/docs';

export default function EventsDocsPage() {
  const { current, next, prev } = getDocNav('/docs/events');
  const content = getDocContent('events');

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
