'use client';

import { Copy } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toggleEventStatus } from '@/lib/event-actions';

interface PublishCardProps {
  eventId: string;
  publishToken: string | null;
  slug: string;
  status: 'draft' | 'published';
}

export function PublishCard({
  eventId,
  publishToken: initialToken,
  slug,
  status,
}: PublishCardProps) {
  const [isPublished, setIsPublished] = useState(status === 'published');
  const [token, setToken] = useState(initialToken);
  const [publishOpen, setPublishOpen] = useState(false);
  const [unpublishOpen, setUnpublishOpen] = useState(false);

  const shareUrl = token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/e/${slug}/${token}`
    : '';

  async function handlePublish() {
    setPublishOpen(false);
    const result = await toggleEventStatus(eventId);
    if (result?.publishToken) {
      setToken(result.publishToken);
    }
    setIsPublished(true);
  }

  async function handleUnpublish() {
    setUnpublishOpen(false);
    await toggleEventStatus(eventId);
    setToken(null);
    setIsPublished(false);
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl);
  }

  if (isPublished) {
    return (
      <div className="bg-muted/50 rounded-md p-4">
        <p className="text-sm font-medium">Event is live</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Your schedule is published and accessible to anyone with the link.
        </p>
        <div className="mt-3 flex gap-2">
          <Input readOnly value={shareUrl} className="text-xs" />
          <TooltipProvider delay={300}>
            <Tooltip>
              <TooltipTrigger
                className="border-input bg-background hover:bg-muted inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-sm"
                onClick={copyLink}
              >
                <Copy className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent>Copy link</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="destructive"
          size="sm"
          className="mt-3 w-full"
          onClick={() => setUnpublishOpen(true)}
        >
          Unpublish
        </Button>
        <AlertDialog open={unpublishOpen} onOpenChange={setUnpublishOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Unpublish event?</AlertDialogTitle>
              <AlertDialogDescription>
                The current link will stop working. If you republish later, a new link will be
                generated.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleUnpublish}>Unpublish</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  return (
    <div className="bg-muted/50 rounded-md p-4">
      <p className="text-sm font-medium">Ready to publish?</p>
      <p className="text-muted-foreground mt-1 text-xs">
        Publishing generates a unique link for attendees to view your schedule.
      </p>
      <Button size="sm" className="mt-3 w-full" onClick={() => setPublishOpen(true)}>
        Publish
      </Button>
      <AlertDialog open={publishOpen} onOpenChange={setPublishOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Publish event?</AlertDialogTitle>
            <AlertDialogDescription>
              A unique shareable link will be generated. You can unpublish at any time.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handlePublish}>Publish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
