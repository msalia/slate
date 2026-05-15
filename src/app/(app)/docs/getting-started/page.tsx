import { DocsPageContent } from '@/components/layout/docs-page';
import { getDocContent, getDocNav } from '@/lib/docs';

export default function GettingStartedPage() {
  const { current, next, prev } = getDocNav('/docs/getting-started');
  const content = getDocContent('getting-started');

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
