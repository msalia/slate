import { describe, expect, it } from 'vitest';

import { toSlug } from '@/lib/slug';

describe('toSlug', () => {
  it('converts a name to kebab case', () => {
    expect(toSlug('My Conference')).toBe('my-conference');
  });

  it('handles multiple spaces', () => {
    expect(toSlug('My  Big   Conference')).toBe('my-big-conference');
  });

  it('removes special characters', () => {
    expect(toSlug('Hello World! @2026')).toBe('hello-world-2026');
  });

  it('trims leading and trailing whitespace', () => {
    expect(toSlug('  hello world  ')).toBe('hello-world');
  });

  it('removes leading and trailing hyphens', () => {
    expect(toSlug('-hello-world-')).toBe('hello-world');
  });

  it('collapses multiple hyphens', () => {
    expect(toSlug('hello---world')).toBe('hello-world');
  });

  it('handles underscores', () => {
    expect(toSlug('hello_world')).toBe('hello-world');
  });

  it('handles mixed case', () => {
    expect(toSlug('Tech Summit 2026')).toBe('tech-summit-2026');
  });
});
