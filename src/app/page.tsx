import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  Columns3,
  Globe,
  Palette,
  Share2,
  Users,
} from 'lucide-react';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { Hero } from '@/components/landing/hero';
import { buttonVariants } from '@/components/ui/button';
import { decrypt } from '@/lib/auth/session';
import { cn } from '@/lib/utils';

const features = [
  {
    description:
      'Build your event schedule on a visual time grid with tracks as columns. Drag sessions to rearrange.',
    icon: Columns3,
    title: 'Visual Schedule Builder',
  },
  {
    description:
      'Color-code sessions by type — talks, workshops, panels — for instant visual identification.',
    icon: Palette,
    title: 'Category Color-Coding',
  },
  {
    description:
      'Maintain a reusable presenter roster with names, roles, and bios across all your events.',
    icon: Users,
    title: 'Presenter Management',
  },
  {
    description:
      'Share a clean, read-only schedule with attendees via a unique link. Filter by track or presenter.',
    icon: Share2,
    title: 'Shareable Attendee View',
  },
  {
    description:
      'Export your full schedule or individual sessions as .ics files for any calendar app.',
    icon: CalendarCheck,
    title: 'Calendar Export',
  },
  {
    description:
      "Work in draft mode until you're ready. Publish when done — attendees see the latest version.",
    icon: Globe,
    title: 'Draft & Publish',
  },
];

export default async function Home() {
  const cookie = (await cookies()).get('session')?.value;
  const session = await decrypt(cookie);

  if (session?.userId) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="absolute top-0 right-0 left-0 z-20 flex h-14 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <span className="font-semibold">Slate</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
            Sign in
          </Link>
          <Link href="/signup" className={cn(buttonVariants())}>
            Get Started
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Hero />

        <section className="bg-muted/30 border-t px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Everything you need to plan your event
              </h2>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl">
                From building the schedule to sharing it with attendees — Slate handles the entire
                workflow.
              </p>
            </div>
            <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="space-y-3">
                  <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-medium">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t px-6 py-16">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Get Started
            </p>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">
              Build your next event
              <br />
              schedule with Slate.
            </h3>
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'mt-6 gap-2')}>
              Create your first event
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Product
            </p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                Create an account
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Log in to your account
              </Link>
            </nav>
          </div>

          <div>
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              Information
            </p>
            <nav className="mt-4 flex flex-col gap-2.5 text-sm">
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
            </nav>
          </div>
        </div>

        <div className="mx-auto mt-12 flex max-w-5xl items-center justify-between border-t pt-8">
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />© {new Date().getFullYear()} Slate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
