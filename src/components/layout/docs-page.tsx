'use client';

import { ArrowLeft, ArrowRight, Copy } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { TopBar } from '@/components/layout/top-bar';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocsPageProps {
  content: string;
  description: string;
  next: { href: string; title: string } | null;
  prev: { href: string; title: string } | null;
  title: string;
}

export function DocsPageContent({ content, description, next, prev, title }: DocsPageProps) {
  const bodyContent = content.replace(/^#[^\n]+\n+/, '');

  return (
    <>
      <TopBar title={title} breadcrumbs={[{ href: '/docs', label: 'Docs' }, { label: title }]} />
      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-3xl">
          <div className="mb-10 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
              <p className="text-muted-foreground mt-2 text-base">{description}</p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigator.clipboard.writeText(bodyContent)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy Page
              </Button>
              {prev ? (
                <Link
                  href={prev.href}
                  className={cn(buttonVariants({ size: 'icon-sm', variant: 'outline' }))}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ size: 'icon-sm', variant: 'outline' }),
                    'pointer-events-none opacity-50',
                  )}
                >
                  <ArrowLeft className="h-4 w-4" />
                </span>
              )}
              {next ? (
                <Link
                  href={next.href}
                  className={cn(buttonVariants({ size: 'icon-sm', variant: 'outline' }))}
                >
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <span
                  className={cn(
                    buttonVariants({ size: 'icon-sm', variant: 'outline' }),
                    'pointer-events-none opacity-50',
                  )}
                >
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </div>
          </div>

          <article className="prose prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-h2:mb-4 prose-h2:mt-10 prose-h2:text-xl prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-li:leading-relaxed prose-code:rounded prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{bodyContent}</ReactMarkdown>
          </article>

          <nav className="mt-12 flex items-center justify-between border-t pt-6">
            {prev ? (
              <Link
                href={prev.href}
                className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-2 rounded-md border px-4 py-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                {prev.title}
              </Link>
            ) : (
              <div />
            )}
            {next ? (
              <Link
                href={next.href}
                className="hover:bg-muted flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium"
              >
                {next.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </div>
      </div>
    </>
  );
}
