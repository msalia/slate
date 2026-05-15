import { DocsPageContent } from '@/components/layout/docs-page';
import { getDocContent, getDocNav } from '@/lib/docs';

export default function PresentersDocsPage() {
  const { current, next, prev } = getDocNav('/docs/presenters');
  const content = getDocContent('presenters');

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
